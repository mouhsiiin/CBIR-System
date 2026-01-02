# CBIR System - Frontend

Modern React-based frontend for the Content-Based Image Retrieval (CBIR) system. Built with React 19, Vite, and Tailwind CSS.

## Features

- **Step-by-step Workflow**: Intuitive multi-step interface for CBIR operations
- **Image Upload**: Drag-and-drop or click to upload images
- **Object Detection Visualization**: Real-time bounding boxes with labels
- **Interactive Feature Weights**: Adjust color, texture, and shape importance
- **Search Results Display**: Visual similarity results with scores
- **Gallery View**: Browse all processed images with detected objects
- **Feature Viewer**: Detailed visualization of extracted features
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Lucide React** - Icon library
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm 8.0 or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── steps/          # Workflow step components
│   │   ├── Header.jsx      # Application header
│   │   ├── ImageUpload.jsx # Image upload component
│   │   ├── DetectedObjects.jsx
│   │   ├── FeatureWeights.jsx
│   │   ├── SearchResults.jsx
│   │   ├── FeatureViewer.jsx
│   │   └── Toast.jsx       # Notification component
│   ├── pages/              # Application pages
│   │   └── Gallery.jsx     # Image gallery page
│   ├── services/           # API services
│   │   └── api.js          # Backend API client
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   ├── index.css           # Global styles
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
└── package.json            # Dependencies and scripts
```

## API Integration

The frontend communicates with the Flask backend API at `http://localhost:5000`. Key endpoints:

- **Image Management**: Upload, list, delete images
- **Object Detection**: Detect objects in uploaded images
- **Feature Extraction**: Extract visual features from objects
- **Similarity Search**: Find similar objects based on features

See the backend README for complete API documentation.

## Development

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Environment Configuration

The backend API URL is configured in `src/services/api.js`. Update it if your backend runs on a different port or host.

## Components Overview

### Main Components

- **App.jsx**: Main application with state management and workflow orchestration
- **Header.jsx**: Navigation and page title
- **WorkflowTabs**: Step indicator for the CBIR workflow

### Step Components

1. **UploadStep**: Image upload interface
2. **DetectionStep**: Object detection results display
3. **SearchConfigStep**: Feature weight configuration and object selection
4. **ResultsStep**: Similar images search results

### Utility Components

- **Toast**: Notification system for user feedback
- **FeatureViewer**: Detailed feature analysis visualization
- **ImageWithBoundingBoxes**: Object detection overlay

## Styling

The application uses Tailwind CSS for styling with custom configurations:

- Custom color scheme
- Responsive breakpoints
- Custom animations and transitions

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

See the main repository README for contribution guidelines.

## License

MIT License - see the LICENSE file in the root directory.
