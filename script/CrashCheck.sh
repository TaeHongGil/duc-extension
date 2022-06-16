
############ 타겟폴더
ndkPath=$1/Contents/NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/llvm-addr2line
targetPath=$2
errorCode=$3
#resource_backup폴더 생성
# if [ ! -e ~/Desktop/crash ]; then
#     mkdir ~/Desktop/crash
# fi

#ndk파일 없으면 exit
if [ ! -e $ndkPath ]; then
    echo "$ndkPath not exist"
    exit
fi

#타겟파일 없으면 exit
if [ ! -e $targetPath ]; then
    echo "$targetPath not exist"
    exit
fi

echo "


"
$ndkPath -C -f -e $targetPath $errorCode

echo "


"