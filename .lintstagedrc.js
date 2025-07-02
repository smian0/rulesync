export default {
  "*.{ts,js}": [
    "biome check --write",
    "oxlint --fix"
  ],
  "*.ts": [
    () => "tsgo --noEmit"
  ],
  "**/*": [
    "secretlint",
    "cspell"
  ]
};