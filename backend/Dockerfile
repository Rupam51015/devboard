FROM golang:1.22-alpine

WORKDIR /app

COPY go.mod go.sum ./

# downloads all the external Go modules listed in your go.mod file
RUN go mod download

COPY . .

# Disable Go compiler and forces to compile dependency files and put outputs to devboard-backend in current location
RUN CGO_ENABLED=0 go build -o devboard-backend .

# add user and group with UID 10001 and without password then give permission to /app of app user and app geoup
RUN adduser -D -u 10001 app && chown -R app:app /app
USER app

EXPOSE 8080
ENTRYPOINT ["./devboard-backend"]
