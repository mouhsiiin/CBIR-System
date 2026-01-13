"""
Comprehensive test script for 3D Model API endpoints
Tests Global Features Based Similarity (Groups G1 & G5)
"""

import requests
from pathlib import Path
import json


BASE_URL = 'http://localhost:5000'


def test_health():
    """Test API health"""
    print("\n=== Testing API Health ===")
    resp = requests.get(f'{BASE_URL}/api/health')
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    return resp.status_code == 200


def test_upload_model(model_path):
    """Upload a 3D model (.obj file)"""
    print(f"\n=== Uploading Model: {model_path} ===")
    
    if not Path(model_path).exists():
        print(f"Error: File not found - {model_path}")
        return None
    
    with open(model_path, 'rb') as f:
        files = {'model': f}
        resp = requests.post(f'{BASE_URL}/api/3d/upload', files=files)
    
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    return result.get('model_id')


def test_list_models():
    """List all 3D models"""
    print("\n=== Listing All 3D Models ===")
    resp = requests.get(f'{BASE_URL}/api/3d/models')
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(f"Found {len(result['models'])} models:")
    for model in result['models']:
        print(f"  - {model['model_id']} (features: {model['has_features']})")
    return result['models']


def test_extract_features(model_id, metadata=None):
    """Extract global features from a 3D model"""
    print(f"\n=== Extracting Features: {model_id} ===")
    
    payload = {'model_id': model_id}
    if metadata:
        payload['metadata'] = metadata
    
    resp = requests.post(f'{BASE_URL}/api/3d/features/extract', json=payload)
    print(f"Status: {resp.status_code}")
    result = resp.json()
    
    if 'features' in result:
        features = result['features']
        print("\nExtracted Features:")
        print(f"  Volume: {features['volume']:.6f}")
        print(f"  Surface Area: {features['surface_area']:.6f}")
        print(f"  Compactness: {features['compactness']:.6f}")
        print(f"  Aspect Ratio XY: {features['aspect_ratio_xy']:.6f}")
        print(f"  Aspect Ratio XZ: {features['aspect_ratio_xz']:.6f}")
        print(f"  Moment Inertia X: {features['moment_inertia_x']:.6f}")
        print(f"  Moment Inertia Y: {features['moment_inertia_y']:.6f}")
        
        if 'mesh_info' in features:
            mesh = features['mesh_info']
            print(f"\nMesh Info:")
            print(f"  Vertices: {mesh['num_vertices']}")
            print(f"  Faces: {mesh['num_faces']}")
            print(f"  Bounding Box: {mesh['bounding_box']}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    return result


def test_extract_batch(model_ids):
    """Extract features from multiple models"""
    print(f"\n=== Batch Feature Extraction ===")
    print(f"Processing {len(model_ids)} models...")
    
    resp = requests.post(f'{BASE_URL}/api/3d/features/extract/batch', 
                        json={'model_ids': model_ids})
    print(f"Status: {resp.status_code}")
    result = resp.json()
    
    print(f"Processed: {len(result['processed'])} models")
    print(f"Errors: {len(result['errors'])}")
    
    if result['errors']:
        print("\nErrors:")
        for error in result['errors']:
            print(f"  - {error['model_id']}: {error['error']}")
    
    return result


def test_get_model_detail(model_id):
    """Get detailed information about a model"""
    print(f"\n=== Model Details: {model_id} ===")
    resp = requests.get(f'{BASE_URL}/api/3d/models/{model_id}')
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    return result


def test_search_similar(query_model_id, top_k=5, weights=None):
    """Search for similar 3D models using Euclidean distance"""
    print(f"\n=== Similarity Search: {query_model_id} ===")
    print(f"Finding top {top_k} similar models...")
    
    payload = {
        'query_model_id': query_model_id,
        'top_k': top_k
    }
    
    if weights:
        payload['weights'] = weights
        print(f"Using custom weights: {weights}")
    
    resp = requests.post(f'{BASE_URL}/api/3d/search', json=payload)
    print(f"Status: {resp.status_code}")
    result = resp.json()
    
    if 'results' in result:
        print(f"\nFound {len(result['results'])} similar models:")
        for i, match in enumerate(result['results'], 1):
            print(f"\n{i}. Model ID: {match['model_id']}")
            print(f"   Distance: {match['distance']:.6f}")
            print(f"   Volume: {match['features']['volume']:.6f}")
            print(f"   Compactness: {match['features']['compactness']:.6f}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    return result


def test_database_stats():
    """Get 3D database statistics"""
    print("\n=== 3D Database Statistics ===")
    resp = requests.get(f'{BASE_URL}/api/3d/stats')
    print(f"Status: {resp.status_code}")
    result = resp.json()
    
    if 'count' in result and result['count'] > 0:
        print(f"Total models in database: {result['count']}")
        print(f"\nFeature Statistics:")
        
        feature_names = result['feature_names']
        means = result['feature_means']
        stds = result['feature_stds']
        
        for name, mean, std in zip(feature_names, means, stds):
            print(f"  {name}: μ={mean:.6f}, σ={std:.6f}")
    else:
        print("Database is empty")
    
    return result


def test_weighted_search(query_model_id, top_k=5):
    """Test similarity search with custom feature weights"""
    print(f"\n=== Weighted Similarity Search ===")
    print("Testing different weight configurations...\n")
    
    # Weight configurations to test
    weight_configs = {
        'Equal Weights': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        'Volume & Surface Focus': [2.0, 2.0, 0.5, 0.5, 0.5, 0.5, 0.5],
        'Shape Focus': [0.5, 0.5, 2.0, 2.0, 2.0, 1.0, 1.0],
        'Compactness Focus': [0.5, 0.5, 3.0, 0.5, 0.5, 0.5, 0.5]
    }
    
    results = {}
    for config_name, weights in weight_configs.items():
        print(f"\n--- {config_name} ---")
        result = test_search_similar(query_model_id, top_k=top_k, weights=weights)
        results[config_name] = result
    
    return results


def run_full_test_suite():
    """Run comprehensive test suite"""
    print("=" * 60)
    print("3D MODEL API - COMPREHENSIVE TEST SUITE")
    print("Global Features Based Similarity (Groups G1 & G5)")
    print("=" * 60)
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ API is not responding. Please start the server first.")
        return
    
    # Test 2: List existing models
    models = test_list_models()
    
    if not models:
        print("\n⚠️  No models found. Please upload some .obj files first.")
        print("\nYou can upload models using:")
        print("  POST /api/3d/upload")
        return
    
    # Test 3: Extract features for all models (batch)
    model_ids = [m['model_id'] for m in models if not m['has_features']]
    if model_ids:
        print(f"\n📊 Extracting features for {len(model_ids)} models...")
        test_extract_batch(model_ids)
    
    # Test 4: Get details for first model
    first_model = models[0]['model_id']
    test_get_model_detail(first_model)
    
    # Test 5: Database statistics
    test_database_stats()
    
    # Test 6: Basic similarity search
    if len(models) >= 2:
        test_search_similar(first_model, top_k=5)
        
        # Test 7: Weighted similarity search
        test_weighted_search(first_model, top_k=3)
    
    print("\n" + "=" * 60)
    print("✅ TEST SUITE COMPLETED")
    print("=" * 60)


def interactive_test():
    """Interactive testing mode"""
    print("\n=== Interactive 3D API Test ===")
    print("\n1. Upload new model")
    print("2. List all models")
    print("3. Extract features")
    print("4. Search similar models")
    print("5. Run full test suite")
    print("0. Exit")
    
    choice = input("\nEnter choice: ").strip()
    
    if choice == '1':
        path = input("Enter path to .obj file: ").strip()
        model_id = test_upload_model(path)
        if model_id:
            print(f"\n✅ Uploaded successfully as: {model_id}")
    
    elif choice == '2':
        test_list_models()
    
    elif choice == '3':
        model_id = input("Enter model_id: ").strip()
        test_extract_features(model_id)
    
    elif choice == '4':
        model_id = input("Enter query model_id: ").strip()
        top_k = int(input("Number of results (default 5): ").strip() or "5")
        test_search_similar(model_id, top_k)
    
    elif choice == '5':
        run_full_test_suite()
    
    elif choice == '0':
        return
    
    # Continue interactive mode
    if choice != '0':
        input("\nPress Enter to continue...")
        interactive_test()


def main():
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--full':
            run_full_test_suite()
        elif sys.argv[1] == '--upload':
            if len(sys.argv) > 2:
                test_upload_model(sys.argv[2])
            else:
                print("Usage: python test_3d_api.py --upload <path_to_obj_file>")
        elif sys.argv[1] == '--search':
            if len(sys.argv) > 2:
                test_search_similar(sys.argv[2])
            else:
                print("Usage: python test_3d_api.py --search <model_id>")
        else:
            print("Unknown option. Use --full, --upload, or --search")
    else:
        interactive_test()


if __name__ == '__main__':
    main()
