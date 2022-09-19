ssh -tt ec2-user@beyond-dev.doubleugames.com<<EOF
cd /beyond/html5_server/logs
tail -n 100 catalina.out
EOF

