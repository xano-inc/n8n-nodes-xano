# 🧩 How to Build and Link a Custom n8n Node Locally

````md
# 🚀 Custom n8n Node Setup Guide

This guide will walk you through building your custom n8n node (e.g., `n8n-nodes-xano`) and integrating it into your local n8n setup.

---

## ⚙️ 1. Build Your Custom Node

First, build your custom n8n node from its source directory.

```bash
# Navigate to your custom node's directory
cd ~/path/to/n8n-nodes-xano

# Install dependencies
npm install

# Build the node
npm run build
````

> 💡 *Make sure `n8n-nodes-xano` is your custom package. Replace it accordingly if different.*

---

## ⚙️ 2. One-Time n8n Setup

This step links your custom node with the global n8n environment.

```bash
# Install n8n globally (if not already installed)
FIRST GO TO THE ROOT DIRECTORY WITH COMMAND "cd"

cd

npm install -g n8n

# Start n8n once to generate the config folder
n8n

# Press Ctrl+C (or Cmd+C) to stop n8n
```

Now configure the custom directory:

```bash
# Go to the n8n configuration directory
cd ~/.n8n  # Example: /Users/your-user/.n8n

# Create a 'custom' folder if it doesn't exist
mkdir -p custom

# Navigate into the custom folder
cd custom

# Initialize a new Node.js project
npm init -y

# Link your custom node into n8n
npm link n8n-nodes-xano
```

---

## ▶️ 3. Start n8n with Custom Modules Enabled

Now you're ready to launch n8n using your linked custom nodes:
- Navigate to your custom node's directory


```bash
n8n start
```

> ✅ Your custom nodes should now appear in the n8n UI. You can use them like any built-in nodes!

