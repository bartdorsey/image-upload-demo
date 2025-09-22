# Deploying to Render.com

This guide walks you through deploying your image-upload-demo application to Render.com.

## Prerequisites

1. A [Render account](https://render.com/)
2. S3-compatible storage account (choose one):
   - [AWS S3](https://aws.amazon.com/s3/) - Traditional option
   - [Cloudflare R2](https://cloudflare.com/products/r2/) - Free tier, simpler setup
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Database Setup

1. Log in to your Render dashboard
2. Go to "New" → "PostgreSQL"
3. Fill in the details:
   - Name: `image-upload-db`
   - Database: `photos`
   - User: Leave as default
   - Region: Choose closest to your users
   - Plan: Free
4. Click "Create Database"
5. Take note of the "Internal Database URL" - you'll need it for your backend configuration

### 2. Storage Setup

Choose either AWS S3 or Cloudflare R2:

#### Option A: AWS S3

1. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Create a new bucket named `photos` (or update `BUCKET_NAME` env var)
   - Enable public read access for uploaded images
   - Note the bucket name and region

2. **Create IAM User**:
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach policy with S3 permissions for your bucket
   - Save the Access Key ID and Secret Access Key

3. **Environment Variables for AWS**:
   - `S3_ENDPOINT_URL`: (leave empty for AWS S3)
   - `S3_PUBLIC_URL`: (leave empty for AWS S3)
   - `REGION_NAME`: Your AWS region (e.g., `us-east-1`)

#### Option B: Cloudflare R2 (Recommended - Free & Simple)

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2 Object Storage
   - Create a new bucket named `photos`
   - Enable public access for the bucket

2. **Create R2 API Token**:
   - Go to "Manage R2 API Tokens"
   - Create a new token with "Object Read and Write" permissions
   - Save the Access Key ID and Secret Access Key

3. **Get R2 Endpoints**:
   - Note your Account ID from the R2 dashboard
   - Your endpoints will be:
     - S3 API: `https://<account-id>.r2.cloudflarestorage.com`
     - Public URL: `https://<bucket>.r2.dev` (if public access enabled)

4. **Environment Variables for R2**:
   - `S3_ENDPOINT_URL`: `https://<account-id>.r2.cloudflarestorage.com`
   - `S3_PUBLIC_URL`: `https://<bucket>.r2.dev`
   - `REGION_NAME`: `auto`

### 3. Deploy Backend (FastAPI)

1. **Create Web Service**:
   - Go to "New" → "Web Service"
   - Connect your Git repository
   - Configure:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Environment**: Python 3.11+

2. **Set Environment Variables**:
   Navigate to "Environment" and add these variables:
   - `AWS_ACCESS_KEY`: Your S3 access key ID
   - `AWS_SECRET_KEY`: Your S3 secret access key
   - `S3_ENDPOINT_URL`: (leave empty for AWS S3 or set to `https://s3.amazonaws.com`)
   - `S3_PUBLIC_URL`: (leave empty for AWS S3 or set to `https://s3.amazonaws.com`)
   - `BUCKET_NAME`: `photos` (or your bucket name)
   - `REGION_NAME`: Your AWS region (e.g., `us-east-1`)
   - `DATABASE_URL`: (automatically set by Render when you connect the PostgreSQL service)
   - `CORS_ORIGINS`: Your frontend URL (you'll update this after frontend deployment)

### 4. Deploy Frontend (React)

1. **Create Static Site**:
   - Go to "New" → "Static Site"
   - Connect your Git repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Set Environment Variables** (if needed):
   - `VITE_API_URL`: Your backend service URL (e.g., `https://your-backend.onrender.com`)

3. **Note Frontend URL**: Save the deployed frontend URL for CORS configuration

### 5. Configure CORS and Final Setup

1. **Update Backend CORS**:
   - Go to your backend service environment variables
   - Update `CORS_ORIGINS` to include your frontend URL:
     ```
     https://your-frontend.onrender.com
     ```

2. **Configure CORS**:

   **For AWS S3**:
   In your S3 bucket settings, add this CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-frontend.onrender.com"],
       "ExposeHeaders": []
     }
   ]
   ```

   **For Cloudflare R2**:
   In your R2 bucket settings, add this CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-frontend.onrender.com"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Connect Database to Backend**:
   - In your backend service settings, connect the PostgreSQL database
   - Render will automatically set the `DATABASE_URL` environment variable

### 6. Test Your Deployment

1. Navigate to your frontend URL
2. Test uploading an image and verify it works correctly
3. Check that images display in the gallery
4. Verify the fullsize image view works

## Troubleshooting

### Common Issues

1. **CORS errors**:
   - Update S3 bucket CORS configuration with your actual frontend URL
   - Ensure `CORS_ORIGINS` in backend includes your frontend URL

2. **Database connection fails**:
   - Verify PostgreSQL service is connected to backend
   - Check `DATABASE_URL` is automatically set

3. **File uploads fail**:
   - Verify AWS credentials are correct
   - Ensure S3 bucket exists and has proper permissions
   - Check `BUCKET_NAME` and `REGION_NAME` are set correctly

4. **Frontend can't connect to backend**:
   - Set `VITE_API_URL` to your backend service URL
   - Ensure backend service is running

5. **Images not displaying**:
   - Check S3 bucket has public read permissions
   - Verify pre-signed URL generation is working

### Viewing Logs

To diagnose problems:

1. Go to the specific service in your Render dashboard
2. Click on "Logs" to see what's happening
3. Look for error messages related to:
   - Database connections
   - S3 authentication
   - CORS issues
   - Environment variable errors

### Environment Variables Checklist

**Backend Service Required Variables**:
- ✅ `AWS_ACCESS_KEY`
- ✅ `AWS_SECRET_KEY`
- ✅ `BUCKET_NAME`
- ✅ `REGION_NAME`
- ✅ `CORS_ORIGINS`
- ✅ `DATABASE_URL` (auto-set by Render)

**Frontend Service Optional Variables**:
- `VITE_API_URL` (if backend URL differs from default)

## Production Considerations

### Security
- Use separate S3 buckets for staging and production
- Implement proper IAM policies with minimal required permissions
- Consider using Render's secret management for sensitive variables

### Performance
- Upgrade to paid Render plans for better performance and zero downtime deployments
- Consider using a CDN for serving images
- Monitor database performance and upgrade plan as needed

### Monitoring
- Set up Render's monitoring and alerting
- Monitor S3 usage and costs
- Track application performance and errors
