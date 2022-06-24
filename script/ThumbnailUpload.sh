
############ 타겟폴더, sftp폴더버전
folderPath=$1
fileName=$2
serverFileName=$3
############ sftp 정보
sftpServer=ec2-user@duc-dev.doubleugames.com
sftpPath=$4
############

cd $folderPath
mv $fileName $serverFileName

sftp -oPort=7302 $sftpServer <<EOF
cd $sftpPath
put $serverFileName
bye
EOF

mv $serverFileName $fileName