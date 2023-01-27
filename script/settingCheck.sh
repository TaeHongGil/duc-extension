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
if [ ! -d "jdk-8" ] ; then
    file_id="1IJGYtrr3BjsvpjftxQ-MQG5ciNHIFbL2"
    file_name="jdk-8.zip"
    curl -sc /tmp/cookie "https://drive.google.com/uc?export=download&id=${file_id}" > /dev/null
    code="$(awk '/_warning_/ {print $NF}' /tmp/cookie)"
    curl -Lb /tmp/cookie "https://drive.google.com/uc?export=download&confirm=${code}&id=${file_id}" -o ${file_name}
    7z x -y jdk-8.zip
fi

##gradle
if [ ! -d "gradle-2.14.1" ] ; then
    file_id="1B5riLTBuN6aYQHKr69ir-2DoQWxtjatc"
    file_name="gradle-2.14.1.zip"
    curl -sc /tmp/cookie "https://drive.google.com/uc?export=download&id=${file_id}" > /dev/null
    code="$(awk '/_warning_/ {print $NF}' /tmp/cookie)"
    curl -Lb /tmp/cookie "https://drive.google.com/uc?export=download&confirm=${code}&id=${file_id}" -o ${file_name}
    7z x -y gradle-2.14.1.zip
fi

##tomcat
if [ ! -d "tomcat-8.5" ] ; then
    file_id="1pWIKRToKSfau81gYr0mQ7_t3O0g4d2hD"
    file_name="tomcat-8.5.zip"
    curl -sc /tmp/cookie "https://drive.google.com/uc?export=download&id=${file_id}" > /dev/null
    code="$(awk '/_warning_/ {print $NF}' /tmp/cookie)"
    curl -Lb /tmp/cookie "https://drive.google.com/uc?export=download&confirm=${code}&id=${file_id}" -o ${file_name}
    7z x -y tomcat-8.5.zip
fi

return