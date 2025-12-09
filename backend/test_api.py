"""
Test script for SmartGallery Backend API
"""

import requests
import json
from pathlib import Path

BASE_URL = 'http://localhost:5000'

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f'{BASE_URL}/api/health')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_upload_image(image_path):
    """Test image upload"""
    print(f"Uploading image: {image_path}")
    with open(image_path, 'rb') as f:
        files = {'images': f}
        response = requests.post(f'{BASE_URL}/api/images/upload', files=files)
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}\n")
    
    if result.get('uploaded'):
        return result['uploaded'][0]['image_id']
    return None

def test_detect(image_id):
    """Test object detection"""
    print(f"Detecting objects in image: {image_id}")
    response = requests.post(f'{BASE_URL}/api/detect', 
                            json={'image_id': image_id})
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Detections: {json.dumps(result, indent=2)}\n")
    return result

def test_extract_features(image_id, object_id):
    """Test feature extraction"""
    print(f"Extracting features for image: {image_id}, object: {object_id}")
    response = requests.post(f'{BASE_URL}/api/features/extract',
                            json={'image_id': image_id, 'object_id': object_id})
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Features extracted successfully")
        print(f"Feature types: {list(result.get('features', {}).keys())}\n")
        return result
    else:
        print(f"Error: {response.text}\n")
        return None

def test_visualize_features(image_id, object_id):
    """Test feature visualization"""
    print(f"Getting formatted features for image: {image_id}, object: {object_id}")
    response = requests.get(f'{BASE_URL}/api/features/{image_id}/{object_id}')
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Formatted features: {json.dumps(result, indent=2)}\n")
        return result
    else:
        print(f"Error: {response.text}\n")
        return None

def test_similarity_search(query_image_id, query_object_id, top_k=5):
    """Test similarity search"""
    print(f"Searching for similar objects...")
    response = requests.post(f'{BASE_URL}/api/search/similar',
                            json={
                                'query_image_id': query_image_id,
                                'query_object_id': query_object_id,
                                'top_k': top_k
                            })
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Found {len(result.get('similar_objects', []))} similar objects")
        for i, obj in enumerate(result.get('similar_objects', [])[:3]):
            print(f"  {i+1}. Image: {obj['image_id']}, "
                  f"Object: {obj['object_id']}, "
                  f"Class: {obj['class']}, "
                  f"Similarity: {obj['similarity']:.3f}")
        print()
        return result
    else:
        print(f"Error: {response.text}\n")
        return None

def test_stats():
    """Test database statistics"""
    print("Getting database statistics...")
    response = requests.get(f'{BASE_URL}/api/stats')
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Stats: {json.dumps(result, indent=2)}\n")
    return result

def main():
    """Run all tests"""
    print("=" * 60)
    print("SmartGallery Backend API Test")
    print("=" * 60 + "\n")
    
    # Test 1: Health check
    test_health()
    
    # Test 2: Upload image (you need to provide a test image path)
    test_image = input("Enter path to test image (or press Enter to skip): ").strip()
    if not test_image:
        print("Skipping image tests. Please provide a test image to continue.\n")
        return
    
    if not Path(test_image).exists():
        print(f"Image not found: {test_image}\n")
        return
    
    image_id = test_upload_image(test_image)
    if not image_id:
        print("Failed to upload image\n")
        return
    
    # Test 3: Object detection
    detection_result = test_detect(image_id)
    if not detection_result.get('detections'):
        print("No objects detected\n")
        return
    
    print(f"Detected {len(detection_result['detections'])} objects\n")
    
    # Test 4: Feature extraction for first object
    test_extract_features(image_id, 0)
    
    # Test 5: Visualize features
    test_visualize_features(image_id, 0)
    
    # Test 6: Upload and process more images for similarity search
    print("To test similarity search, you need multiple images.")
    print("Upload more images and extract their features...\n")
    
    # Test 7: Statistics
    test_stats()
    
    print("=" * 60)
    print("Tests completed!")
    print("=" * 60)

if __name__ == '__main__':
    main()