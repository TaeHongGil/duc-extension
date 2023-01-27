cd ~/

7z -h
if [ $? -eq 0 ]; then
    echo "pass"
else
    brew install p7zip
fi

##jvm, gradle 폴더
if [ ! -d "/ducSetting" ] ; then
    mkdir ducSetting
fi

cd ./ducSetting
# ##jvm
if [ ! -d "crash" ] ; then
    file_id="1uaMbCQaAub0-aSsAztTuU1OyNvXhcvbX"
    file_name="crash.zip"
    curl -sc /tmp/cookie "https://drive.google.com/uc?export=download&id=${file_id}" > /dev/null
    code="$(awk '/_warning_/ {print $NF}' /tmp/cookie)"
    curl -Lb /tmp/cookie "https://drive.google.com/uc?export=download&confirm=${code}&id=${file_id}" -o ${file_name}
    7z x -y -ocrash crash.zip
fi

return