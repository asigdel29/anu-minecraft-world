# File: server/Dockerfile
#
# Sentience world — world presence server container image for Railway.
#
# Change history:
#   Date        Author      Summary
#   2026-06-16  asigdel29   Add world-server image.

FROM golang:1.26 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/worldserver .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/worldserver /worldserver
EXPOSE 8090
USER nonroot:nonroot
ENTRYPOINT ["/worldserver"]
