import {app, ipcMain} from 'electron';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import {Docker} from 'node-docker-api';
import {API_BASE_URL, API_BASE_URL_PORT} from '../helper';
import * as process from "node:process";
import os from "os";
import * as tarStream from 'tar-stream';
import dgram from 'dgram';

const homeDir = os.homedir();
const rancherSock = path.join(homeDir, '.rd', 'docker.sock');
const dockerDesktopSock = '/var/run/docker.sock';

const getSocketPath = () => {
    let socketPath;
    if (process.platform === 'win32') {
        socketPath = '//./pipe/docker_engine'
    } else if (process.platform === 'linux') {
        socketPath = '/var/run/docker.sock'
    } else {
        if (isRancherDesktop()) {
            socketPath = rancherSock
        } else {
            socketPath = dockerDesktopSock
        }
    }
    return socketPath
}

const docker = new Docker({ socketPath: getSocketPath() });

function isRancherDesktop() {
    return fs.existsSync(rancherSock);
}

export const knowledgeBaseIpcHandlers = () => {

  ipcMain.handle('submit-files', async (_, files) => {
    try {

      const formData = new FormData();
      files.forEach((file: { name: string; data: any }) => {
        formData.append('files', Buffer.from(file.data), file.name);
      });

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error saving files:', error);
      throw error;
    }
  });

};

export const createPythonServerContainer = async ()=> {
    const dy_port = `${API_BASE_URL_PORT}/tcp`;
    const imageName = 'velocityaiworkbench'
    const containerName = 'velocityaiworkbench'
    const volumes = [
        { name: "vaw_documents_volume", mount: "/home/appuser/documents" },
        { name: "vaw_documents_volume", mount: "/home/appuser/db" }
    ];

    await ensureVolumes(volumes)
    const { imageVersion, imageCreatedDate }: any = await getDockerImageMetadata(imageName);
    console.log("Current Image Version: " + imageVersion)
    console.log("Current Image Created Date: " + imageCreatedDate)
    const { tarVersion, tarCreatedDate }: any = await getTarImageMetadata(getTarFilePath());
    console.log("Tar Version: " + tarVersion)
    console.log("Tar Created Date: " + tarCreatedDate)
    const new_image: string = imageName + ":" + tarVersion

    const hostIp = await getDefaultHostIP();

    const containerOptions = {
      Image: new_image,
      name: containerName, // Specify container name
      Tty: true, // Enable TTY
      ExposedPorts: { [dy_port]: {} }, // Dynamically use the resolved dy_port
      HostConfig: {
        PortBindings: {
          [dy_port]: [{ HostPort: `${API_BASE_URL_PORT}` }], // Map the dynamic container port to the host port
        },
        Binds: volumes.map(v => `${v.name}:${v.mount}`),
        ExtraHosts: ["host.docker.internal:host-gateway"] // Add host mapping
      },
      Env: [
        `HOST_IP=${hostIp}`,
        `OLLAMA_HOST=http://${hostIp}:11434`
      ]
    };

    if (imageVersion !== tarVersion || tarCreatedDate.getTime() > imageCreatedDate.getTime()) {
        console.log(`Updating image from version ${imageVersion} to ${tarVersion}...`);
        const currentContainer = await getExistingContainer(containerName);
        if (currentContainer) {
            await currentContainer.stop();
            await currentContainer.delete({force: true});
        }
        await removeExistingImage(imageName);
        await loadDockerImageFromTar();
        const newContainer = await docker.container.create(containerOptions);
        await newContainer.start();
        console.log(`Container ${containerName} updated successfully.`);
    } else {
        const container = await getExistingContainer(containerName);
        if (!container) {
          await (await docker.container.create(containerOptions)).start();
        } else if ((await container.status()).data.State !== 'running') {
          console.log("Container State:", (await container.status()).data.State);
          await container.start();
        }
    }
}

async function loadDockerImageFromTar() {
    const stream = fs.createReadStream(getTarFilePath());
    try {
        const response = await docker.image.load(stream);
        console.log('Image loaded successfully.', response);
    } catch (error) {
        console.log('Failed to load docker-image.', error);
    }
}

async function getDockerImageMetadata(imageName: string): Promise<{ imageVersion: string, imageCreatedDate: Date }> {
    const DEFAULT_VERSION = 'latest';
    const DEFAULT_DATE = new Date('2000-01-01T00:00:00Z');
    try {
        const images = await docker.image.list();
        for (const image of images) {
            const details: any = await image.status();
            const repoTags: string[] = details?.data?.RepoTags || [];
            for (const tag of repoTags) {
                if (tag.startsWith(imageName)) {
                    const imageVersion = tag.split(':')[1] || DEFAULT_VERSION;
                    const createdDate = new Date(details.data.Created);
                    return { imageVersion, imageCreatedDate: createdDate };
                }
            }

        }
        return { imageVersion: DEFAULT_VERSION, imageCreatedDate: DEFAULT_DATE };
    } catch (error) {
        console.error(`Failed to get Docker image metadata for "${imageName}":`, error);
        return { imageVersion: DEFAULT_VERSION, imageCreatedDate: DEFAULT_DATE };
    }
}


const getTarImageMetadata = async (tarPath: string): Promise<{ tarVersion: string, tarCreatedDate: Date } | null> => {
    return new Promise((resolve, reject) => {
        let manifestData = '';
        let configFileName = '';
        let tarVersion = '';

        // Buffers for config file
        let configData = '';

        // First pass: Extract manifest.json
        const extractManifest = tarStream.extract();
        fs.createReadStream(tarPath).pipe(extractManifest);

        extractManifest.on('entry', (header, stream, next) => {
            if (header.name === 'manifest.json') {
                const chunks: Buffer[] = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => {
                    try {
                        manifestData = Buffer.concat(chunks).toString();
                        const manifest = JSON.parse(manifestData);
                        if (manifest.length > 0) {
                            const repoTags = manifest[0].RepoTags;
                            if (repoTags && repoTags.length > 0) {
                                const versionMatch = repoTags[0].match(/:(.+)$/);
                                if (versionMatch) {
                                    tarVersion = versionMatch[1];
                                }
                            }
                            configFileName = manifest[0].Config;
                        }
                        next();
                    } catch (error) {
                        console.error('Error parsing manifest.json:', error);
                        reject(error);
                    }
                });
            } else {
                stream.resume();
                stream.on('end', next);
            }
        });

        extractManifest.on('finish', () => {
            if (!configFileName) {
                return reject(new Error('Could not find config file in manifest.json'));
            }

            // Second pass: Extract config.json
            const extractConfig = tarStream.extract();
            fs.createReadStream(tarPath).pipe(extractConfig);

            extractConfig.on('entry', (header, stream, next) => {
                if (header.name === configFileName) {
                    const chunks: Buffer[] = [];
                    stream.on('data', (chunk) => chunks.push(chunk));
                    stream.on('end', () => {
                        try {
                            configData = Buffer.concat(chunks).toString();
                            const config = JSON.parse(configData);
                            if (config.created) {
                                resolve({
                                    tarVersion: tarVersion,
                                    tarCreatedDate: new Date(config.created),
                                });
                            } else {
                                reject(new Error('No created date found in config.json'));
                            }
                            next();
                        } catch (error) {
                            reject(error);
                        }
                    });
                } else {
                    stream.resume();
                    stream.on('end', next);
                }
            });

            extractConfig.on('error', (err) => {
                console.error('Error extracting config.json:', err);
                reject(err);
            });
        });

        extractManifest.on('error', (err) => {
            console.error('Error reading manifest.json:', err);
            reject(err);
        });
    });
};


async function ensureVolumes(volumes: any) {
    for (const volume of volumes) {
        try {
            const existingVolumes = await docker.volume.list();
            const volumeExists = existingVolumes.some((v: any) => v.data.Name === volume.name);

            if (!volumeExists) {
                console.log(`Creating volume: ${volume.name}`);
                await docker.volume.create({ Name: volume.name });
            } else {
                console.log(`Volume already exists: ${volume.name}`);
            }
        } catch (error) {
            console.error(`Error ensuring volume ${volume.name}:`, error);
        }
    }
}

const getTarFilePath = () => {
    const imageDirectory = app.isPackaged ? path.join(process.resourcesPath, 'image') : path.join(process.cwd(), 'image');
    return path.join(imageDirectory, 'velocityaiworkbench.tar');
}

const getExistingContainer = async (containerName: any) => {
    const containers = await docker.container.list({ all: true });
    const existingContainer: any = containers.find((detail: any) =>
      detail.data.Names && detail.data.Names.includes(`/${containerName}`)
    );
    return existingContainer;
}

const removeExistingImage = async (imageName: any) => {
    const images = await docker.image.list();
    const matchingImages = images.filter((image:any) => {
      const repoTags = image.data.RepoTags || [];
      return repoTags.some((tag: string) => tag.startsWith(`${imageName}:`));
    });
    await Promise.all(
      matchingImages.map(image => image.remove({ force: true }))
    );
}

function getDefaultHostIP() {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        socket.connect(80, '8.8.8.8', () => { // doesn't actually send packets
            const address = socket.address();
            socket.close();
            resolve(address.address);
        });
        socket.on('error', (err) => {
            socket.close();
            reject(err);
        });
    });
}