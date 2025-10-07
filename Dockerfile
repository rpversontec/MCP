# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de definición de paquetes y el lockfile
COPY package*.json ./

# Instala las dependencias de producción
# Nota: pm2 puede seguir instalado si está en "dependencies", pero ya no se usa.
RUN npm install --production

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que corre nuestro servidor unificado
EXPOSE 3000

# El comando para iniciar la aplicación
CMD [ "node", "server.js" ]