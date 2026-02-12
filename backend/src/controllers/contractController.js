const fs = require('fs');
const path = require('path');
const algosdk = require('algosdk');

const algodToken = process.env.ALGOD_TOKEN === undefined ? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' : process.env.ALGOD_TOKEN;
const algodServer = process.env.ALGOD_SERVER || 'http://localhost';
const algodPort = process.env.ALGOD_PORT || 4001;

const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

exports.getContractParams = async (req, res) => {
    try {
        const approvalPath = path.join(__dirname, '../../../smart_contracts/approval.teal');
        const clearPath = path.join(__dirname, '../../../smart_contracts/clear_state.teal');

        // console.log('Resolving paths:', approvalPath);

        if (!fs.existsSync(approvalPath) || !fs.existsSync(clearPath)) {
            console.error('Files not found at resolved paths:', approvalPath);
            return res.status(500).json({ error: 'TEAL files not found. Run python contract.py first.' });
        }

        const approvalSource = fs.readFileSync(approvalPath, 'utf8');
        const clearSource = fs.readFileSync(clearPath, 'utf8');

        // Compile
        const approvalCompiled = await client.compile(approvalSource).do();
        const clearCompiled = await client.compile(clearSource).do();

        res.json({
            approvalProgram: approvalCompiled.result, // base64
            clearProgram: clearCompiled.result, // base64
            globalSchema: { numUint: 2, numByteSlice: 2 },
            localSchema: { numUint: 2, numByteSlice: 0 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to compile contract', details: error.message });
    }
};
