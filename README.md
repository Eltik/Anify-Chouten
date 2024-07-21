# Chouten Repository

## Overview

Welcome to the Chouten repository! Chouten is a cross-platform modular app designed for watching anime, reading manga, and exploring light novels. It is powered by the Anify API, which provides extensive data for Japanese media. This repository contains the core components and modules required to build and extend Chouten's functionalities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Building the Repository](#building-the-repository)
- [Building Individual Modules](#building-individual-modules)
- [Directory Structure](#directory-structure)
- [Support](#support)

## Prerequisites

To get started with Chouten, you'll need to install the following tools:

- [Bun](https://bun.sh): A modern JavaScript runtime for faster builds.
- [NodeJS](https://nodejs.org/): JavaScript runtime built on Chrome's V8 JavaScript engine.
- `jq`: A lightweight and flexible command-line JSON processor.
- `zip`: A compression utility to handle zip archives.

Ensure these tools are installed and available in your system's PATH.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Eltik/Anify-Chouten.git
   cd Anify-Chouten
   ```
2. **Install Dependencies**
    Install the necessary dependencies using Bun:
    ```bash
    bun install
    ```
## Building the Repository

To build the entire repository to hard-install the repository in Chouten, follow these steps:

1. Navigate to the `anify` directory:
    ```bash
    cd anify
    ```
2. Run the build command:
    ```bash
    bun run build
    ```
This command will compile the entire repository and generate a `.zip` file for you to then install. Generally, this is unnecessary as you can simply just add the repository via the GitHub URL.

## Building Individual Modules

Chouten is designed with modularity in mind. You can build individual modules as needed. Each module is located in the `anify/Modules/module-src` directory.

1. Navigate to the specific module directory:
    ```bash
    cd anify/Modules/module-src/{module-id}
    ```
2. Build the module:
    ```bash
    bun run build
    ```
This command generates a folder with the module's ID, containing the files required for that module.

## Directory Structure
Here is an overview of the key directories in the repository:

- `anify/`: Metadata information and where most commands will be run for building the repository.
- `anify/Modules/`: Where modules will be built to.
- `anify/Modules/module-src/`: Source code for all modules.
- `anify/Modules/{module-id}/`: Build folder output for individual modules.

## Support

For any questions or support, please visit the following Discords:
- [Chouten's Discord](https://discord.gg/az4XZ6u5Dg)
- [Anify's Discord](https://discord.gg/zBCvFken5W)

Feel free to reach out to the community or file an issue on GitHub for assistance.

Thank you for using Chouten! We hope you enjoy building and expanding the app.