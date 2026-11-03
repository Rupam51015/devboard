FROM dhi.io/golang:1-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o devboard-backend .

FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/devboard-backend ./devboard-backend

RUN chmod +x ./devboard-backend && \
    adduser -D -u 10001 nonroot
USER nonroot

EXPOSE 8080

# Use exec form for proper signal handling
ENTRYPOINT ["./devboard-backend"]