#!/bin/bash

sudo apt-get update
sudo apt-install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
cp hello.html /var/www/html
sudo systemctl restart nginx
echo "DevBoard running on port 80"
