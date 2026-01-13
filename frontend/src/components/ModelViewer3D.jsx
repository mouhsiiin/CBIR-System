import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Simple OBJ loader
const loadOBJ = (url) => {
  console.log('Loading OBJ from:', url);
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch OBJ: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      console.log('OBJ text loaded, length:', data.length);
      return parseOBJ(data);
    })
    .catch(error => {
      console.error('Error loading OBJ:', error);
      throw error;
    });
};

const parseOBJ = (text) => {
  const vertices = [];
  const faces = [];
  const lines = text.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    
    if (parts[0] === 'v' && parts.length >= 4) {
      // Vertex position
      vertices.push(new THREE.Vector3(
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      ));
    } else if (parts[0] === 'f' && parts.length >= 4) {
      // Face indices (support triangles and quads)
      const faceVertices = [];
      
      for (let i = 1; i < parts.length; i++) {
        // Parse vertex indices (handle v, v/vt, v/vt/vn, and v//vn formats)
        const indices = parts[i].split('/');
        const vertexIndex = parseInt(indices[0]) - 1;
        
        if (vertexIndex >= 0) {
          faceVertices.push(vertexIndex);
        }
      }
      
      // Convert quads to triangles
      if (faceVertices.length === 3) {
        faces.push(faceVertices[0], faceVertices[1], faceVertices[2]);
      } else if (faceVertices.length === 4) {
        // Split quad into two triangles
        faces.push(faceVertices[0], faceVertices[1], faceVertices[2]);
        faces.push(faceVertices[0], faceVertices[2], faceVertices[3]);
      } else if (faceVertices.length > 4) {
        // Fan triangulation for polygons
        for (let i = 1; i < faceVertices.length - 1; i++) {
          faces.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
        }
      }
    }
  }

  console.log(`Parsed OBJ: ${vertices.length} vertices, ${faces.length} indices`);
  return { vertices, faces };
};

export default function ModelViewer3D({ modelUrl, className = '' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    if (!modelUrl || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load OBJ
    loadOBJ(modelUrl)
      .then(({ vertices, faces }) => {
        if (vertices.length === 0) {
          throw new Error('No vertices found in OBJ file');
        }

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(vertices.length * 3);

        vertices.forEach((v, i) => {
          positions[i * 3] = v.x;
          positions[i * 3 + 1] = v.y;
          positions[i * 3 + 2] = v.z;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        if (faces.length > 0) {
          geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(faces), 1));
        }

        geometry.computeVertexNormals();

        // Center and scale geometry
        geometry.center();
        
        // Calculate bounding box and scale to fit
        const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position'));
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;
        geometry.scale(scale, scale, scale);

        const material = new THREE.MeshPhongMaterial({
          color: 0x4f46e5,
          emissive: 0x1e1b4b,
          shininess: 100,
          wireframe: false,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);

        console.log('Mesh created and added to scene');

        // Auto-rotate animation
        let animationId;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (meshRef.current) {
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.y += 0.002;
          }
          renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => cancelAnimationFrame(animationId);
      })
      .catch(error => {
        console.error('Error loading OBJ:', error);
        
        // Try to display error on canvas
        const canvas = renderer.domElement;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ef4444';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Error loading model', canvas.width / 2, canvas.height / 2 - 20);
          ctx.font = '12px sans-serif';
          ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 20);
        }
      });

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      className={`bg-gray-100 w-full h-full ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
}
