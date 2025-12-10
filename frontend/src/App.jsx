// src/App.jsx

import { useState } from 'react'
import Header from './components/Header'
import ImageUpload from './components/ImageUpload'
import DetectedObjects from './components/DetectedObjects'
import FeatureWeights from './components/FeatureWeights'
import SearchResults from './components/SearchResults'
import ImageWithBoundingBoxes from './components/ImageWithBoundingBoxes'
import api from './services/api'
import Gallery from './pages/Gallery'
import FeatureViewer from './components/FeatureViewer'
import { Info } from 'lucide-react'

function App() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState([])
  const [selectedObjects, setSelectedObjects] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [featureWeights, setFeatureWeights] = useState({ color: 40, texture: 60, shape: 30 })
  const [imageId, setImageId] = useState(null)
  const [currentPage, setCurrentPage] = useState('upload')
  const [showFeatures, setShowFeatures] = useState(false)
  const [currentFeatures, setCurrentFeatures] = useState(null)

  // Handler to view extracted features
  const handleViewFeatures = async () => {
    console.log('=== VIEW FEATURES START ===')
    if (!imageId || selectedObjects.length === 0) {
      alert('No object selected')
      return
    }
    
    const objectId = selectedObjects[0]
    console.log('Fetching features for:', imageId, objectId)
    
    try {
      // Try to get features first
      console.log('Attempting to get features...')
      const result = await api.getFeatures(imageId, objectId)
      console.log('Got features:', result)
      setCurrentFeatures(result.features)
      setShowFeatures(true)
      console.log('Modal should open now')
    } catch (error) {
      // If features don't exist, extract them first
      console.log('Features not found, extracting...')
      try {
        await api.extractFeatures(imageId, objectId)
        console.log('Extraction complete, fetching...')
        const result = await api.getFeatures(imageId, objectId)
        console.log('Got features after extraction:', result)
        setCurrentFeatures(result.features)
        setShowFeatures(true)
      } catch (extractError) {
        console.error('Failed:', extractError)
        alert('Failed to load features: ' + extractError.message)
      }
    }
  }

  const handleImageUpload = async (file) => {
    setUploadedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    // Upload to backend and detect objects
    await uploadAndDetect(file)
  }

  const uploadAndDetect = async (file) => {
    console.log('=== uploadAndDetect START ===')
    setIsProcessing(true)
    setSearchResults([])
    
    try {
      // 1. Upload image
      const uploadResult = await api.uploadImage(file)
      const newImageId = uploadResult.uploaded[0].image_id
      setImageId(newImageId)
      
      // 2. Detect objects
      const detectResult = await api.detectObjects(newImageId)
      
      // 3. Format detections
      const formattedDetections = detectResult.detections.map((det, idx) => ({
        id: idx,
        label: det.class,
        class: det.class,
        confidence: det.confidence,
        bbox: det.bbox
      }))
      
      setDetectedObjects(formattedDetections)
      setSelectedObjects(formattedDetections.length > 0 ? [0] : [])
      
      // 4. Pre-extract features for first object in background
      if (formattedDetections.length > 0) {
        api.extractFeatures(newImageId, 0).catch(err => 
          console.error('Background feature extraction failed:', err)
        )
      }
      
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to process image: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
    setDetectedObjects([])
    setSelectedObjects([])
    setSearchResults([])
    setImageId(null)
  }

  const toggleObjectSelection = (id) => {
    setSelectedObjects(prev => 
      prev.includes(id) 
        ? prev.filter(objId => objId !== id)
        : [...prev, id]
    )
  }

  const handleWeightsChange = (weights) => {
    setFeatureWeights(weights)
  }

  const handleSearch = async (weights) => {
    if (selectedObjects.length === 0) {
      alert('Please select at least one detected object to search')
      return
    }

    setIsSearching(true)
    
    try {
      // Use first selected object for search
      const objectId = selectedObjects[0]
      
      // 1. Extract features first (if not already extracted)
      await api.extractFeatures(imageId, objectId)
      
      // 2. Convert weights from percentage to decimal
      // Distribute weights across all feature types
      const apiWeights = {
        color: weights.color / 100,
        texture_tamura: weights.texture / 300,  // Split texture weight 3 ways
        texture_gabor: weights.texture / 300,
        texture_lbp: weights.texture / 300,
        shape_hu: weights.shape / 300,  // Split shape weight 3 ways
        shape_hog: weights.shape / 300,
        shape_contour: weights.shape / 300
      }
      
      // 3. Search for similar objects
      const searchResult = await api.searchSimilar(
        imageId, 
        objectId, 
        20,  // top 20 results
        apiWeights
      )
      
      // 4. Format results for UI
      const formattedResults = searchResult.similar_objects.map((obj, idx) => ({
        id: idx + 1,
        image_id: obj.image_id,
        object_id: obj.object_id,
        similarity: obj.similarity,
        class: obj.class,
        confidence: obj.confidence,
        bbox: obj.bbox
      }))
      
      setSearchResults(formattedResults)
      
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed: ' + error.message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseImageAsQuery = async (imageId, filename) => {
    // Switch to upload page
    setCurrentPage('upload')
    
    // Set image preview
    const imageUrl = api.getImageUrl(filename)
    setImagePreview(imageUrl)
    setImageId(imageId)
    
    // Detect objects
    setIsProcessing(true)
    try {
      const detectResult = await api.detectObjects(imageId)
      
      const formattedDetections = detectResult.detections.map((det, idx) => ({
        id: idx,
        label: det.class,
        class: det.class,
        confidence: det.confidence,
        bbox: det.bbox
      }))
      
      setDetectedObjects(formattedDetections)
      setSelectedObjects(formattedDetections.length > 0 ? [0] : [])
      
      // Pre-extract features
      if (formattedDetections.length > 0) {
        api.extractFeatures(imageId, 0).catch(err => 
          console.error('Background feature extraction failed:', err)
        )
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to process image: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="pt-20 px-6 pb-6">
        <div className="max-w-[1800px] mx-auto">
          {currentPage === 'upload' ? (
            <div className="grid grid-cols-5 gap-6 h-[calc(100vh-120px)]">
              
              {/* LEFT PANEL */}
              <div className="col-span-2 panel p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold text-[#212529] mb-4">
                  📤 Upload Query Image
                </h2>
                
                {!imagePreview ? (
                  <ImageUpload onImageUpload={handleImageUpload} />
                ) : (
                  <ImageWithBoundingBoxes 
                    imageUrl={imagePreview} 
                    detections={detectedObjects}
                    onClear={handleClearImage} 
                  />
                )}

                {isProcessing && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin h-5 w-5 border-2 border-[#007BFF] border-t-transparent rounded-full"></div>
                      <span className="text-[#007BFF] font-medium">Detecting objects...</span>
                    </div>
                  </div>
                )}

                <DetectedObjects 
                  objects={detectedObjects}
                  selectedObjects={selectedObjects}
                  onToggleSelection={toggleObjectSelection}
                />

                {detectedObjects.length > 0 && (
                  <FeatureWeights 
                    onWeightsChange={handleWeightsChange}
                    onSearch={handleSearch}
                  />
                )}

                {/* VIEW FEATURES BUTTON */}
                {detectedObjects.length > 0 && imageId && (
                  <button
                    onClick={handleViewFeatures}
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Info className="w-5 h-5" />
                    <span>View Extracted Features</span>
                  </button>
                )}
              </div>

              {/* RIGHT PANEL */}
              <div className="col-span-3 panel p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#212529]">
                    🎯 Search Results
                    {searchResults.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-[#6C757D]">
                        ({searchResults.length} images)
                      </span>
                    )}
                  </h2>
                  {searchResults.length > 0 && (
                    <div className="flex space-x-3">
                      <select className="input-field py-1 text-sm">
                        <option>Sort by: Similarity</option>
                        <option>Sort by: Date</option>
                      </select>
                      <select className="input-field py-1 text-sm">
                        <option>Filter: All</option>
                        <option>Filter: High Match (&gt;90%)</option>
                        <option>Filter: Medium Match (70-90%)</option>
                      </select>
                    </div>
                  )}
                </div>

                <SearchResults results={searchResults} isLoading={isSearching} />
              </div>

            </div>
          ) : (
            <Gallery onUseAsQuery={handleUseImageAsQuery} />
          )}
        </div>
      </main>

      {/* FEATURE VIEWER MODAL */}
      {showFeatures && (
        <FeatureViewer
          features={currentFeatures}
          onClose={() => setShowFeatures(false)}
        />
      )}
    </div>
  )
}

export default App