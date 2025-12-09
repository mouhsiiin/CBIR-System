# /home/muhammed/Documents/SmartGallery/backend/services/object_detection.py

from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path

class ObjectDetectionService:
    """Service for detecting objects using fine-tuned YOLOv8 model"""
    
    # The 15 classes from your fine-tuned model
    CLASS_NAMES = {
        0: 'person',
        1: 'bicycle',
        2: 'car',
        4: 'airplane',
        8: 'boat',
        9: 'traffic_light',
        14: 'bird',
        15: 'cat',
        16: 'dog',
        17: 'horse',
        25: 'umbrella',
        39: 'bottle',
        47: 'apple',
        52: 'pizza',
        63: 'laptop'
    }
    
    def __init__(self, model_path):
        """Initialize with fine-tuned model"""
        self.model_path = model_path
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the YOLO model"""
        try:
            self.model = YOLO(self.model_path)
            print(f"✓ Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            raise
    
    def is_loaded(self):
        """Check if model is loaded"""
        return self.model is not None
    
    def detect(self, image_path, conf_threshold=0.25):
        """
        Detect objects in an image
        
        Args:
            image_path: Path to image file
            conf_threshold: Confidence threshold for detections
            
        Returns:
            List of detections with bbox, class, confidence
        """
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        # Run inference
        results = self.model(image_path, conf=conf_threshold)
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                
                # Get class name
                class_name = result.names[class_id] if class_id in result.names else f"class_{class_id}"
                
                detections.append({
                    'bbox': [float(x1), float(y1), float(x2), float(y2)],
                    'confidence': confidence,
                    'class': class_name,
                    'class_id': class_id
                })
        
        return detections
    
    def detect_and_visualize(self, image_path, output_path=None):
        """
        Detect objects and create visualization
        
        Args:
            image_path: Path to input image
            output_path: Path to save annotated image (optional)
            
        Returns:
            Detections list and annotated image path
        """
        detections = self.detect(image_path)
        
        # Read image
        img = cv2.imread(str(image_path))
        
        # Draw bounding boxes
        for det in detections:
            x1, y1, x2, y2 = [int(v) for v in det['bbox']]
            
            # Draw box
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw label
            label = f"{det['class']} {det['confidence']:.2f}"
            cv2.putText(img, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save if output path provided
        if output_path:
            cv2.imwrite(str(output_path), img)
        
        return detections, img