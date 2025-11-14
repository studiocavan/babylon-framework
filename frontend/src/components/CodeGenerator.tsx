import React, { useState } from 'react';
import { generateCode } from '../services/api';
import { ProjectConfig, ProjectType, DatabaseType, Feature, GenerateCodeResponse } from '../types';
import './CodeGenerator.css';

const CodeGenerator: React.FC = () => {
  const [formData, setFormData] = useState<ProjectConfig>({
    projectName: '',
    projectType: 'rest-api',
    database: 'postgresql',
    authentication: true,
    features: []
  });
  
  const [generatedCode, setGeneratedCode] = useState<GenerateCodeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const projectTypes: Array<{ value: ProjectType; label: string }> = [
    { value: 'rest-api', label: 'REST API' },
    { value: 'graphql-api', label: 'GraphQL API' },
    { value: 'microservice', label: 'Microservice' },
    { value: 'crud-app', label: 'CRUD Application' }
  ];

  const databases: Array<{ value: DatabaseType; label: string }> = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'redis', label: 'Redis' }
  ];

  const availableFeatures: Array<{ value: Feature; label: string }> = [
    { value: 'docker', label: 'Docker Support' },
    { value: 'swagger', label: 'Swagger/OpenAPI' },
    { value: 'testing', label: 'Unit Tests' },
    { value: 'logging', label: 'Logging' },
    { value: 'caching', label: 'Caching' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureToggle = (feature: Feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateCode(formData);
      setGeneratedCode(result);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const downloadCode = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-generator">
      <div className="generator-container">
        <div className="form-section">
          <h2>Project Configuration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="my-awesome-project"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectType">Project Type</label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
              >
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="database">Database</label>
              <select
                id="database"
                name="database"
                value={formData.database}
                onChange={handleInputChange}
              >
                {databases.map(db => (
                  <option key={db.value} value={db.value}>
                    {db.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="authentication"
                  checked={formData.authentication}
                  onChange={handleInputChange}
                />
                <span>Include Authentication</span>
              </label>
            </div>

            <div className="form-group">
              <label>Additional Features</label>
              <div className="features-grid">
                {availableFeatures.map(feature => (
                  <label key={feature.value} className="feature-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.value)}
                      onChange={() => handleFeatureToggle(feature.value)}
                    />
                    <span>{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="generate-btn" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Code'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {generatedCode && (
          <div className="output-section">
            <h2>Generated Code</h2>
            <div className="files-list">
              {generatedCode.files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-header">
                    <h3>{file.filename}</h3>
                    <button
                      onClick={() => downloadCode(file.filename, file.content)}
                      className="download-btn"
                    >
                      Download
                    </button>
                  </div>
                  <pre className="code-preview">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                generatedCode.files.forEach(file => {
                  downloadCode(file.filename, file.content);
                });
              }}
              className="download-all-btn"
            >
              Download All Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;
