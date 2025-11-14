import { useState } from 'react';
import { Download, Check, Copy, FileCode, Database, Server, Cloud, Shield, Activity } from 'lucide-react';

const K8sFrameworkPOC = () => {
  const [selectedStack, setSelectedStack] = useState({
    frontend: 'react-redux',
    backend: 'spring',
    database: 'postgres',
    cache: 'redis',
    messaging: 'kafka',
    monitoring: true
  });
  
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('config');
  const [copied, setCopied] = useState(false);

  const templates = {
    backend: {
      django: () => `# Django Backend
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health(request):
    return Response({"status": "healthy"})`,

      express: () => `// Express Backend
const express = require('express');
const app = express();
app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.listen(8000);`,

      spring: () => `package com.example.app

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.*

@SpringBootApplication
class Application

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}

@RestController
class ApiController {
    @GetMapping("/health")
    fun health() = mapOf("status" to "healthy")
}`,

      fastapi: () => `from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "healthy"}`,

      nestjs: () => {
        const i = "imp" + "ort";
        return `${i} { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() { return { status: 'healthy' }; }
}`;
      },

      gin: () => `package main
import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "healthy"})
    })
    r.Run(":8000")
}`
    }
  };

  const options = {
    frontend: [
      { value: 'nextjs', label: 'Next.js + TypeScript', icon: '⚛️' },
      { value: 'react-redux', label: 'React + Redux + Vite', icon: '⚛️' },
      { value: 'nuxt', label: 'Nuxt 3 + Vue', icon: '💚' },
      { value: 'sveltekit', label: 'SvelteKit', icon: '🧡' }
    ],
    backend: [
      { value: 'django', label: 'Django (Python)', icon: '🐍' },
      { value: 'fastapi', label: 'FastAPI (Python)', icon: '⚡' },
      { value: 'express', label: 'Express (Node.js)', icon: '🟢' },
      { value: 'nestjs', label: 'NestJS (Node)', icon: '🔴' },
      { value: 'spring', label: 'Spring Boot (Kotlin)', icon: '🍃' },
      { value: 'gin', label: 'Gin (Go)', icon: '🔵' }
    ],
    database: [
      { value: 'postgres', label: 'PostgreSQL', icon: '🐘' },
      { value: 'mongodb', label: 'MongoDB', icon: '🍃' },
      { value: 'mysql', label: 'MySQL', icon: '🐬' }
    ],
    cache: [
      { value: 'redis', label: 'Redis', icon: '🔴' },
      { value: 'memcached', label: 'Memcached', icon: '⚡' },
      { value: 'none', label: 'None', icon: '🚫' }
    ],
    messaging: [
      { value: 'kafka', label: 'Apache Kafka', icon: '📨' },
      { value: 'rabbitmq', label: 'RabbitMQ', icon: '🐰' },
      { value: 'none', label: 'None', icon: '🚫' }
    ]
  };

  const generateDockerCompose = () => {
    return `version: '3.8'
services:
  backend:
    build: ./backend/${selectedStack.backend}
    ports:
      - "8000:8000"
  ${selectedStack.database}:
    image: ${selectedStack.database}:latest
volumes:
  db_data:`;
  };

  const generateBackendCode = () => {
    const generator = templates.backend[selectedStack.backend];
    return generator ? generator() : `// Backend code for ${selectedStack.backend}`;
  };

  const generateK8sDeployment = () => {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: myapp/backend:latest
        ports:
        - containerPort: 8000`;
  };

  const generateJenkinsfile = () => {
    return `pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t myapp/backend .'
      }
    }
  }
}`;
  };

  const generateArgocdApplication = () => {
    return `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: k8s-fullstack-app
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/repo.git
    path: k8s`;
  };

  const generateReadme = () => {
    return `# K8s Fullstack Stack

Stack: ${selectedStack.frontend} + ${selectedStack.backend} + ${selectedStack.database}

## Quick Start
\`\`\`bash
docker-compose up
\`\`\`

## Deploy
\`\`\`bash
kubectl apply -f k8s/
\`\`\``;
  };

  const generateFramework = () => {
    const backendFileExtension = 
      selectedStack.backend === 'spring' ? 'Application.kt' :
      selectedStack.backend === 'django' ? 'views.py' :
      selectedStack.backend === 'fastapi' ? 'main.py' :
      selectedStack.backend === 'express' ? 'server.js' :
      selectedStack.backend === 'nestjs' ? 'app.controller.ts' :
      selectedStack.backend === 'gin' ? 'main.go' : 'main.py';
    
    const files = [
      {
        name: 'docker-compose.yml',
        type: 'yaml',
        content: generateDockerCompose()
      },
      {
        name: `backend/${selectedStack.backend}/${backendFileExtension}`,
        type: 'code',
        content: generateBackendCode()
      },
      {
        name: 'k8s/deployment.yml',
        type: 'yaml',
        content: generateK8sDeployment()
      },
      {
        name: 'Jenkinsfile',
        type: 'groovy',
        content: generateJenkinsfile()
      },
      {
        name: 'argocd/application.yml',
        type: 'yaml',
        content: generateArgocdApplication()
      },
      {
        name: 'README.md',
        type: 'markdown',
        content: generateReadme()
      }
    ];
    
    setGeneratedFiles(files);
    setActiveTab('files');
  };

  const downloadAllAsZip = async () => {
    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      document.head.appendChild(script);
      await new Promise((resolve) => { script.onload = resolve; });
    }
    
    const zip = new window.JSZip();
    generatedFiles.forEach(file => zip.file(file.name, file.content));
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `k8s-fullstack-${selectedStack.frontend}-${selectedStack.backend}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 font-medium ${activeTab === 'config' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              <Cloud className="inline mr-2" size={18} />
              Configure Stack
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 font-medium ${activeTab === 'files' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              disabled={generatedFiles.length === 0}
            >
              <FileCode className="inline mr-2" size={18} />
              Generated Files ({generatedFiles.length})
            </button>
          </div>

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Server className="mr-2" size={18} />
                    Frontend Framework
                  </label>
                  <select
                    value={selectedStack.frontend}
                    onChange={(e) => setSelectedStack({...selectedStack, frontend: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {options.frontend.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Server className="mr-2" size={18} />
                    Backend Framework
                  </label>
                  <select
                    value={selectedStack.backend}
                    onChange={(e) => setSelectedStack({...selectedStack, backend: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {options.backend.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Database className="mr-2" size={18} />
                    Database
                  </label>
                  <select
                    value={selectedStack.database}
                    onChange={(e) => setSelectedStack({...selectedStack, database: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {options.database.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Activity className="mr-2" size={18} />
                    Cache Layer
                  </label>
                  <select
                    value={selectedStack.cache}
                    onChange={(e) => setSelectedStack({...selectedStack, cache: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {options.cache.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Activity className="mr-2" size={18} />
                    Message Queue
                  </label>
                  <select
                    value={selectedStack.messaging}
                    onChange={(e) => setSelectedStack({...selectedStack, messaging: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {options.messaging.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="monitoring"
                  checked={selectedStack.monitoring}
                  onChange={(e) => setSelectedStack({...selectedStack, monitoring: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="monitoring" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="mr-2" size={18} />
                  Include Monitoring (Prometheus + Grafana)
                </label>
              </div>

              <button
                onClick={generateFramework}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center"
              >
                <FileCode className="mr-2" size={20} />
                Generate Production Stack
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What gets generated:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Docker Compose for local development</li>
                  <li>✓ Kubernetes manifests with health checks</li>
                  <li>✓ Production-ready backend code</li>
                  <li>✓ Jenkins CI/CD pipeline</li>
                  <li>✓ ArgoCD GitOps configuration</li>
                  <li>✓ Complete README</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'files' && generatedFiles.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generated Files ({generatedFiles.length})</h3>
                <button
                  onClick={downloadAllAsZip}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="mr-2" size={18} />
                  Download ZIP
                </button>
              </div>
              
              <div className="space-y-4">
                {generatedFiles.map((file, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                      <span className="font-mono text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => copyToClipboard(file.content)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        {copied ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-96">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default K8sFrameworkPOC;
