# Usa una imagen base oficial de Node.js (Alpine es una versión ligera)
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de definición de paquetes y el lockfile
# Esto aprovecha el cache de Docker, para no reinstalar dependencias si no cambian
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --production

# Copia el resto del código de la aplicación
COPY . .

# Expone los puertos en los que corren los servidores
EXPOSE 3000
EXPOSE 4000

# El comando para iniciar la aplicación usando pm2-runtime
# pm2-runtime está diseñado específicamente para contenedores Docker
CMD [ "./node_modules/.bin/pm2-runtime", "ecosystem.config.js" ]
