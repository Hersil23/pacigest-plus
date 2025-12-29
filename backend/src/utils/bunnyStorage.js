const axios = require('axios');
const crypto = require('crypto');

const BUNNY_CONFIG = {
  storageZone: process.env.BUNNY_STORAGE_ZONE,
  password: process.env.BUNNY_STORAGE_PASSWORD,
  hostname: process.env.BUNNY_STORAGE_HOSTNAME,
  cdnUrl: process.env.BUNNY_CDN_URL
};

/**
 * Subir archivo a Bunny.NET Storage
 * @param {Buffer|string} fileData - Datos del archivo (Buffer o base64)
 * @param {string} fileName - Nombre del archivo con extensión
 * @param {string} folder - Carpeta dentro del storage zone (ej: 'patients/123')
 * @returns {Promise<string>} URL pública del archivo
 */
const uploadFile = async (fileData, fileName, folder = '') => {
  try {
    // Convertir base64 a Buffer si es necesario
    let buffer = fileData;
    if (typeof fileData === 'string') {
      // Remover el prefijo data:image/...;base64, si existe
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    }

    // Generar nombre único para evitar colisiones
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const uniqueFileName = `${timestamp}-${randomString}-${fileName}`;

    // Construir la ruta completa
    const path = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
    const uploadUrl = `https://${BUNNY_CONFIG.hostname}/${BUNNY_CONFIG.storageZone}/${path}`;

    // Subir archivo
    const response = await axios.put(uploadUrl, buffer, {
      headers: {
        'AccessKey': BUNNY_CONFIG.password,
        'Content-Type': 'application/octet-stream'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    if (response.status === 201 || response.status === 200) {
      // Retornar URL pública del archivo
      const publicUrl = `${BUNNY_CONFIG.cdnUrl}/${path}`;
      return publicUrl;
    } else {
      throw new Error('Error al subir archivo a Bunny.NET');
    }
  } catch (error) {
    console.error('Error en uploadFile:', error.message);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
};

/**
 * Eliminar archivo de Bunny.NET Storage
 * @param {string} fileUrl - URL completa del archivo en Bunny CDN
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extraer la ruta del archivo de la URL
    const path = fileUrl.replace(`${BUNNY_CONFIG.cdnUrl}/`, '');
    const deleteUrl = `https://${BUNNY_CONFIG.hostname}/${BUNNY_CONFIG.storageZone}/${path}`;

    const response = await axios.delete(deleteUrl, {
      headers: {
        'AccessKey': BUNNY_CONFIG.password
      }
    });

    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error('Error en deleteFile:', error.message);
    // No lanzar error si el archivo no existe (ya fue eliminado)
    if (error.response?.status === 404) {
      return true;
    }
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
};

/**
 * Eliminar múltiples archivos
 * @param {string[]} fileUrls - Array de URLs de archivos
 * @returns {Promise<Object>} Resultado de las eliminaciones
 */
const deleteMultipleFiles = async (fileUrls) => {
  const results = {
    success: [],
    failed: []
  };

  for (const url of fileUrls) {
    try {
      const deleted = await deleteFile(url);
      if (deleted) {
        results.success.push(url);
      } else {
        results.failed.push(url);
      }
    } catch (error) {
      results.failed.push(url);
    }
  }

  return results;
};

/**
 * Validar que la configuración de Bunny.NET esté completa
 * @returns {boolean}
 */
const validateConfig = () => {
  const required = ['storageZone', 'password', 'hostname', 'cdnUrl'];
  const missing = required.filter(key => !BUNNY_CONFIG[key]);
  
  if (missing.length > 0) {
    console.error(`Configuración de Bunny.NET incompleta. Faltan: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

module.exports = {
  uploadFile,
  deleteFile,
  deleteMultipleFiles,
  validateConfig,
  BUNNY_CONFIG
};