# Fix Vercel npm install crash

This package removes the internal package-lock and pins all dependencies to stable versions.

If Vercel still shows `npm error Exit handler never called`, deploy with **Clear Build Cache**:

Vercel Project → Deployments → Redeploy → tick **Clear build cache**.

The old cache came from the previous `invoix-ai` project and can interfere with the new BuildMind dependency tree.
