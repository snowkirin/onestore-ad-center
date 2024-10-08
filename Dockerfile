ARG NGINX_VERSION=1.22.1

FROM nginx:$NGINX_VERSION-alpine

ARG NGINX_VERSION=1.22.1
ARG HEADERS_MORE_VERSION=v0.34

RUN apk --update --no-cache add \
        gcc \
        make \
        libc-dev \
        g++ \
        openssl-dev \
        linux-headers \
        pcre-dev \
        zlib-dev \
        libtool \
        automake \
        autoconf \
        git

RUN cd /opt \
    && git clone --depth 1 -b $HEADERS_MORE_VERSION --single-branch https://github.com/openresty/headers-more-nginx-module.git \
    && cd /opt/headers-more-nginx-module \
    && git submodule update --init \
    && cd /opt \
    && wget -O - http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz | tar zxfv - \
    && mv /opt/nginx-$NGINX_VERSION /opt/nginx \
    && cd /opt/nginx \
    && ./configure --with-compat --add-dynamic-module=/opt/headers-more-nginx-module \
    && make modules

FROM nginx:$NGINX_VERSION-alpine

COPY --from=0 /opt/nginx/objs/ngx_http_headers_more_filter_module.so /usr/lib/nginx/modules

RUN chmod -R 644 \
        /usr/lib/nginx/modules/ngx_http_headers_more_filter_module.so \
    && sed -i '1iload_module \/usr\/lib\/nginx\/modules\/ngx_http_headers_more_filter_module.so;' /etc/nginx/nginx.conf
#COPY build/ /usr/share/nginx/html
COPY dist/ /usr/share/nginx/html
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY 40x.html /usr/share/nginx/html/40x.html
COPY 500.html /usr/share/nginx/html/500.html
COPY default.conf /etc/nginx/conf.d/default.conf

# Validate the config
RUN nginx -t

#FROM nginx:stable
#FROM 676857894110.dkr.ecr.ap-northeast-2.amazonaws.com/nginx:stable
#COPY dist/ /usr/share/nginx/html
#COPY robots.txt /usr/share/nginx/html/robots.txt
#COPY 40x.html /usr/share/nginx/html/40x.html
#COPY 500.html /usr/share/nginx/html/500.html
#COPY default.conf /etc/nginx/conf.d/default.conf
#
#CMD ["nginx", "-g", "daemon off;"]
