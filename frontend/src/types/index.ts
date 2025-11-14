export interface ProjectConfig {
  projectName: string;
  projectType: ProjectType;
  database: DatabaseType;
  authentication: boolean;
  features: Feature[];
}

export type ProjectType = 'rest-api' | 'graphql-api' | 'microservice' | 'crud-app';

export type DatabaseType = 'postgresql' | 'mongodb' | 'mysql' | 'redis';

export type Feature = 'docker' | 'swagger' | 'testing' | 'logging' | 'caching';

export interface GeneratedFile {
  filename: string;
  content: string;
}

export interface GenerateCodeResponse {
  projectName: string;
  files: GeneratedFile[];
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
