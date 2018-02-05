ICO-COT
===============

COT token purchase system

Install
===============
1. nodejs
        curl --silent --location https://rpm.nodesource.com/setup_9.x | sudo bash -
	    yum -y install nodejs
2. gcc+
        yum install gcc-c++ make
3. truffle( this is solidity framework)
        npm install -g truffle
3. OpenZeppelin( this is contract package)
        npm install -E zeppelin-solidity
4. ganache( test tool)
        npm install ganache-cli -g
5. etherum-testrpc( test tool )
        npm install ethereumjs-testrpc
6. Go-lang
        yum install -y epel-release
	    yum install -y golang gmp-devel git
7. Geth( test tool )( 64 bit)
        curl -o ~/go-etherum.tar.gz "https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.7.3-4bb3c89d.tar.gz"
        tar zxvf go-etherum.tar.gz
        cp -R geth-linux-amd64-1.7.3-4bb3c89d/ go-ethereum/
        cp ~/go-ethereum/geth /usr/local/bin
        geth version


Run test blockchain( we have 3 different to build test blockchain)
===============
1. version 1, use testrpc
        testrpc -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
2. version 2, use ganache-cli
        ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
3. version 3, use geth
        continue....

Run Truffle
===============
1.  build file
        truffle compile
2.  deploy contract
        truffle migrate

Run Truffle Test
===============
        truffle test
