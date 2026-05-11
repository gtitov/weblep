## Сервер

Фронтенд на Github, тайлы на французском сервере `/srv/powerlines`. Всё за Cloudflare.

## Генерация тайлов

```sh
tippecanoe --output=pl7.pmtiles PL.geojson --maximum-zoom=7 --minimum-zoom=0 -l PL
tippecanoe --output=points7.pmtiles Points.geojson --maximum-zoom=7 --minimum-zoom=0 -l points -r1
tippecanoe --output=modifications7.pmtiles Modifications.geojson --maximum-zoom=7 --minimum-zoom=0 -l modifications
```