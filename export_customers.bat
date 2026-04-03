@echo off
title Exporting Customer List

echo Fetching customer data from API...
curl -X GET http://localhost:3002/api/customers > customers_export.json

echo Customer list exported to customers_export.json
pause
exit