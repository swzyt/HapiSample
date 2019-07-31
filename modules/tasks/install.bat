:: 关闭所有命令(包括本身这条命令)的回显
@echo off

::用管理员执行时，当前目录会自动切换到C:\Windows\System32，通过cd /d %~dp0可以将当前目录切回到bat文件所在的目录
cd /d %~dp0

::清除之前的符号链接
echo "clean all"

rmdir /s/q config
rmdir /s/q libs
rmdir /s/q node_modules
rmdir /s/q utils

del /s/q models\index.js
del /s/q routes\index.js

del /s/q bootstrap.js
del /s/q index.js
del /s/q server.js
del /s/q settings.js
del /s/q package.json

echo "config"
mklink config /j ..\..\config

echo "libs"
mkdir libs
xcopy ..\..\libs\api_logs\*.* libs\api_logs /s/d/e
copy /y ..\..\libs\cache.js libs\cache.js
copy /y ..\..\libs\db.js libs\db.js
copy /y ..\..\libs\defaultModel.js libs\defaultModel.js
copy /y ..\..\libs\mongodb.js libs\mongodb.js
copy /y ..\..\libs\page_size_number.js libs\page_size_number.js
copy /y ..\..\libs\status.js libs\status.js

echo "node_modules"
mklink node_modules /j ..\..\node_modules

echo "models"
mkdir models
copy /y ..\..\models\index.js models\index.js
xcopy ..\..\models\system\api_log\model.js models\system\api_log\model.js /s/d/e

echo "routes"
mkdir routes
copy /y ..\..\routes\index.js routes\index.js

echo "root"
copy /y ..\..\bootstrap.js bootstrap.js
copy /y ..\..\index.js index.js
copy /y ..\..\server.js server.js
copy /y ..\..\settings.js settings.js
copy /y ..\..\package.json package.json

echo "utils"
mkdir utils
copy /y ..\..\utils\moment.js utils\moment.js

::暂停输出“请按任意键继续…”
pause