# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de definición de paquetes y el lockfile
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --production

# Copia el resto del código de la aplicación
COPY . .

# Expone los puertos para el servidor principal (3000) y el proxy (4000)
EXPOSE 3000
EXPOSE 4000

# El comando para iniciar ambos servidores usando pm2
CMD [ "./node_modules/.bin/pm2-runtime", "ecosystem.config.js" ]
