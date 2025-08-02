#!/bin/bash
echo "Starting JANコード管理アプリ..."
python -m gunicorn --bind=0.0.0.0 --timeout 600 app:app
