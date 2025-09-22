# Deploying to Render.com

This guide walks you through deploying your image-upload-demo application to Render.com.

## Prerequisites

1. A [Render account](https://render.com/)
2. An AWS account or other S3-compatible storage service (optional - you can also use Render's built-in block storage)
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

### 2. S3-Compatible Storage Setup

You have two options:

#### Option A: AWS S3 (recommended for production)

1. Create an S3 bucket in your AWS console
2. Create an IAM user with permissions limited to that bucket
3. Generate access keys for this user
4. Take note of:
   - Access Key ID
   - Secret Access Key
   - S3 bucket name (should be "photos" to match your code)

#### Option B: Use Render Disk (simpler but limited)

1. When setting up your web service, you can add persistent disk storage
2. This works for testing but lacks some S3 features

### 3. Deploy Backend

1. Log in to your Render dashboard
2. Go to "New" → "Blueprint"
3. Connect your Git repository
4. Select the `render.yaml` file at the root of your repository
5. Review the settings and click "Apply"
6. Once created, go to your backend service "image-upload-api"
7. Navigate to "Environment" and add these secret environment variables:
   - `AWS_ACCESS_KEY`: Your S3 access key
   - `AWS_SECRET_KEY`: Your S3 secret key
   - `S3_ENDPOINT_URL`: The endpoint for your S3 service (use https://s3.amazonaws.com for AWS)

### 4. Configure CORS on your S3 bucket

If using AWS S3, add this CORS configuration to your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://image-upload-frontend.onrender.com"],
    "ExposeHeaders": []
  }
]
```

### 5. Test Your Deployment

1. Once all services are deployed, navigate to your frontend URL
2. Test uploading an image and verify it works correctly
3. Check for any errors in your Render logs

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure your S3 bucket has proper CORS configuration
2. **Database connection fails**: Check that your DATABASE_URL environment variable is correctly set
3. **File uploads fail**: Verify AWS credentials are correct and the bucket exists
4. **Frontend can't connect to backend**: Check the VITE_API_URL in your frontend environment variables

### Viewing Logs

To diagnose problems:

1. Go to the specific service in your Render dashboard
2. Click on "Logs" to see what's happening
3. Look for any error messages that can help diagnose the issue

## Upgrading

When you're ready to move beyond the free tier:

1. Navigate to your services in the Render dashboard
2. Click on "Change Plan"
3. Select a paid plan that meets your needs
4. For the database, consider upgrading to a plan with larger storage and automatic backups
