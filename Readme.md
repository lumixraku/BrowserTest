获取packagename 和 activity name

http://www.mamicode.com/info-detail-512788.html

通过apktool获取apk package name（包名）以及activity name

         1）下载apktool:   http://code.google.com/p/android-apktool/

         2）将解压的三个文件(apktool.jar, aapt.exe,  apktool.bat) 拷贝到c: windows

现在，环境搭建完成。

3）cmd进入命令终端，执行 aapt dump badging  your.apk

就会看到对应的Package名，Activity名。