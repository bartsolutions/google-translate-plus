set -x
timestamp=$(date +%Y%m%d%H%M%S)

rm -rf google-translate-plus.firefox google-translate-plus.chrome

cp -rf /app/jarred/google-translate-plus google-translate-plus
sh ../clean_up.sh
cp -rf google-translate-plus google-translate-plus.chrome
cp -rf google-translate-plus google-translate-plus.firefox

cd google-translate-plus.firefox
version=$(cat manifest.json | jq '.version')
version="${version%\"}"
version="${version#\"}"
jq 'del(.key)' manifest.json > tmp.$$.json && mv tmp.$$.json manifest.json
sh ../../clean_up.sh
cd ..

cd google-translate-plus.chrome
jq '.key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyKKfFDRi6Ox3BxQlW3IcN2eV2iQHCMobUVrTK4SM9yLFoZVxs2bcBEjqsIpYTy5HqSuASSrdOoNzCeupO8IFiBWcvtCb/bLof6CdtfYdCx/uKveNrJPxhU6shRh29PKvZaX4qCO9UHABBrNokNV7NmIjysYqhGSQULyzujQRXcbMHHumZxkZ8+pMs4fwWbavS6gge10h4N2UxjA9d4VrToGSPx62VmS7tik/B37cndfZO6eEc7yRzaDDJG5XsBcgIQFjswGjz3dZ5ZlTNwzB9Qfc5RbYBR5pRYJ9NdLHRSZjhvDjNstxKEY3g8p9fOhVKjkMV4X+p8czCLvB2D23BQIDAQAB"' manifest.json > tmp.$$.json && mv tmp.$$.json manifest.json
sh ../../clean_up.sh
cd ..

7za a google-translate-plus.$version.firefox.$timestamp.zip google-translate-plus.firefox
7za a google-translate-plus.$version.chrome.$timestamp.zip google-translate-plus.chrome