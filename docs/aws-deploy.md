# Simple AWS Deployment

This approach bundles the whole app (Next.js + Socket.IO + Prisma) into a single Docker container and deploys it on a single EC2 instance, optionally with a local Postgres container or managed RDS.

## 1. Build a Production Docker Image

Create a Dockerfile at the root of your project:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

This builds and runs the production app on port 3000.

## 2. Launch an EC2 Instance

1. Use AWS EC2 (or Lightsail) for a simpler virtual machine
2. Install Docker on the instance:

```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

## 3. Set Up PostgreSQL

Choose one of the following options:

### Option A: Local PostgreSQL Container

```bash
docker run --name my-postgres \
  -e POSTGRES_PASSWORD=supersecret \
  -p 5432:5432 \
  -d postgres:14
```

### Option B: Amazon RDS
Use Amazon RDS if you want a managed database solution.

## 4. Run the Application Container

1. Push your Docker image to a registry (e.g., Docker Hub or ECR)
2. On the EC2 instance, pull and run it:

```bash
docker pull your-docker-username/your-app:latest
docker run -d --name myapp -p 3000:3000 \
  -e DATABASE_URL=postgresql://username:password@host:5432/dbname \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
  -e CLERK_SECRET_KEY=... \
  ...other env vars... \
  your-docker-username/your-app:latest
```

3. Confirm it's running by visiting `http://your-ec2-public-ip:3000`

## 5. Update DNS and Secure with TLS

1. Point your domain's DNS to this EC2's IP or set up an Elastic IP
2. Use a reverse proxy like Nginx with Certbot on the same instance for HTTPS if needed

## 6. Maintain / Update

To update your application:

```bash
docker pull your-docker-username/your-app:latest
docker stop myapp && docker rm myapp
docker run -d --name myapp -p 3000:3000 ...
```

---

That's it! You now have a single EC2 instance, one (or two) Docker containers, and minimal AWS services. If you need high availability or scaling, you can later add load balancers or ECS/EKS.  
