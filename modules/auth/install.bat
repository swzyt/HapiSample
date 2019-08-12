:: 关闭所有命令(包括本身这条命令)的回显
@echo off

::用管理员执行时，当前目录会自动切换到C:\Windows\System32，通过cd /d %~dp0可以将当前目录切回到bat文件所在的目录
cd /d %~dp0

::清除之前的符号链接
echo "****************** clean all ******************"

echo "config"
rmdir /s/q config

echo "libs"
rmdir /s/q libs

echo "node_modules"
rmdir /s/q node_modules

echo "models"
rmdir /s/q models

echo "routes"
del /s/q routes\index.js

echo "utils"
rmdir /s/q utils

echo "root"
del /s/q bootstrap.js
del /s/q index.js
del /s/q server.js
del /s/q settings.js
del /s/q package.json

echo "****************** mklink ******************"
:: /H      创建硬链接而非符号链接。
:: /j      创建目录联接。

echo "config"
mklink config /J ..\..\config

echo "libs"
mkdir libs
mkdir libs\api_logs
mklink libs\api_logs\index.js /H ..\..\libs\api_logs\index.js
mklink libs\cache.js /H ..\..\libs\cache.js
mklink libs\db.js /H ..\..\libs\db.js
mklink libs\defaultModel.js /H ..\..\libs\defaultModel.js
mklink libs\mongodb.js /H ..\..\libs\mongodb.js
mklink libs\page_size_number.js /H ..\..\libs\page_size_number.js
mklink libs\status.js /H ..\..\libs\status.js

echo "node_modules"
mklink node_modules /J ..\..\node_modules

echo "models"
mkdir models
mkdir models\system
mkdir models\system\app
mkdir models\system\user
mkdir models\system\role
mkdir models\system\role_permission
mkdir models\system\user_role

mklink models\system\api_log /J ..\..\models\system\api_log
mklink models\system\app\model.js /H ..\..\models\system\app\model.js
mklink models\system\user\model.js /H ..\..\models\system\user\model.js
mklink models\system\role\model.js /H ..\..\models\system\role\model.js
mklink models\system\role_permission\model.js /H ..\..\models\system\role_permission\model.js
mklink models\system\user_role\model.js /H ..\..\models\system\user_role\model.js
mklink models\index.js /H ..\..\models\index.js

echo "routes"
mklink routes\index.js /H ..\..\routes\index.js

echo "utils"
mklink utils /J ..\..\utils

echo "root"
mklink bootstrap.js /H ..\..\bootstrap.js
mklink index.js /H ..\..\index.js
mklink server.js /H ..\..\server.js
mklink settings.js /H ..\..\settings.js
mklink package.json /H ..\..\package.json

::暂停输出“请按任意键继续…”
pause