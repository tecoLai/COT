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
4. OpenZeppelin( this is contract package, already installed. Please install it if node_modules does not have this)
        cd "YOUR FOLDER PATH"
        npm install -E zeppelin-solidity
5. ganache( test tool, already installed. Please install it if node_modules does not have this)
        cd "YOUR FOLDER PATH"
        npm install ganache-cli -g
6. etherum-testrpc( test tool, already installed. Please install it if node_modules does not have this )
        cd "YOUR FOLDER PATH"
        npm install ethereumjs-testrpc
7. Go-lang
        yum install -y epel-release
	yum install -y golang gmp-devel git
8. Geth( test tool )( 64 bit)
        curl -o ~/go-etherum.tar.gz "https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.7.3-4bb3c89d.tar.gz"
        tar zxvf go-etherum.tar.gz
        cp -R geth-linux-amd64-1.7.3-4bb3c89d/ go-ethereum/
        cp ~/go-ethereum/geth /usr/local/bin
        geth version


How to run project
===============
1. install Metamask in your browser
2. create private block chain
3. connect Metamask with private block chain
4. compile truffle contract
5. deploy compiled contract into private block chain
6. use Web3 and HTML to interactive with contract and Metamask


Run private blockchain( we have 3 different to build private blockchain)
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
        truffle migrate --reset --network development

Run Truffle Test
===============
        truffle test
