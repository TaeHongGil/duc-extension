############ 타겟폴더, sftp폴더버전
folderName=$1
folderPath=$2
version=$3
date=$(date +%d%일%H시%M분%S초)
slotNum=$4
############ sftp 정보
sftpServer=
sftpPath=/vol/wcasino/html/mobile/download/s$4/$version
############
#p7zip 설치
7z -h
if [ $? -eq 0 ]; then
    echo "pass"
else
    brew install p7zip
fi

sftp -oPort=7302 $sftpServer <<EOF
yes
exit
EOF

#sftp 경로 없으면 exit (첫접속시 에러메세지 확인되는지 모름)
echo "ls $sftpPath" | sftp -oPort=7302 -b - $sftpServer
if [ $? -eq 0 ]; then
    echo ""
else
    echo "

sftp error : check version or sftpPath
sftpServer : $sftpServer
sftpPath : $sftpPath"
    echo "$date sftp error : check version or sftp
    
    "

    echo "
sftp error : check version or sftpPath
sftpServer : $sftpServer
sftpPath : $sftpPath
" > ~/Desktop/resource_backup/error.txt
    echo "$date sftp error : check version or sftp" >> ~/Desktop/resource_backup/errorLog.txt
    exit
fi

#resource_backup폴더 생성
if [ ! -e ~/Desktop/resource_backup ]; then
    mkdir ~/Desktop/resource_backup
fi
#resource_backup폴더 생성
if [ ! -e ~/Desktop/resource_backup/errorLog.txt ]; then
    echo "" > ~/Desktop/resource_backup/errorLog.txt
fi

#타겟폴더 없으면 exit
if [ ! -e $folderPath ]; then
    echo "
    
    $folderPath not exist"
    echo "$date $folderPath not exist
    
    "

    echo "$folderPath not exist" > ~/Desktop/resource_backup/error.txt
    echo "$date $folderPath not exist" >> ~/Desktop/resource_backup/errorLog.txt
    exit
fi

cd $folderPath/../
7z a $folderName.zip $folderName
#zip파일 없으면 exit
if [ ! -e $folderPath.zip ]; then
    echo "
    
    $folderPath.zip not exist"
    echo "$date $folderPath.zip not exist
    
    "

    echo "$folderPath.zip not exist" > ~/Desktop/resource_backup/error.txt
    echo "$date $folderPath.zip not exist" >> ~/Desktop/resource_backup/errorLog.txt
    exit
fi

mv $folderPath ~/Desktop/resource_backup/
mv ~/Desktop/resource_backup/$folderName ~/Desktop/resource_backup/$folderName\_$date
size=$(7z x -y $folderName.zip | grep -A 2 "Size\:")
unzip=$(echo "$size" | awk 'NR==1 {print $2}')
if [ $unzip -ge 50000000 ]; then
  echo "
  
  Check Resource Folder Size
  
  "
  rm $folderName.zip
  exit
fi

sftp -oPort=7302 $sftpServer <<EOF
cd $sftpPath
put $folderName.zip
bye
EOF

rm $folderName.zip



echo "


Result"
echo "Version"
echo "$version"
echo ""
echo "Zip Size"
echo "$size" | awk 'NR==2 {print $2}'
echo ""
echo "UnZip Size"
echo "$size" | awk 'NR==1 {print $2}'
echo ""
echo ""

echo "Version" > ~/Desktop/resource_backup/lastInfo.txt
echo "$version" >> ~/Desktop/resource_backup/lastInfo.txt
echo "" >> ~/Desktop/resource_backup/lastInfo.txt
echo "Zip Size" >> ~/Desktop/resource_backup/lastInfo.txt
echo "$size" | awk 'NR==2 {print $2}'>> ~/Desktop/resource_backup/lastInfo.txt
echo "" >> ~/Desktop/resource_backup/lastInfo.txt
echo "UnZip Size" >> ~/Desktop/resource_backup/lastInfo.txt
echo "$size" | awk 'NR==1 {print $2}'>> ~/Desktop/resource_backup/lastInfo.txt
