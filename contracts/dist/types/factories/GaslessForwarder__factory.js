"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaslessForwarder__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "target",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "signature",
                type: "bytes",
            },
        ],
        name: "execute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "nonces",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const _bytecode = "0x6080604052348015600f57600080fd5b50610c4f8061001f6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80636a6aac641461003b5780637ecebe0014610057575b600080fd5b61005560048036038101906100509190610680565b610087565b005b610071600480360381019061006c9190610727565b6102a5565b60405161007e919061076d565b60405180910390f35b60008060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008154809291906100d8906107b7565b91905055905060008787878785466040516020016100fb969594939291906108a7565b604051602081830303815290604052805190602001209050600061011e826102bd565b9050600061017986868080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050836102f390919063ffffffff16565b90508973ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146101e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101e090610961565b60405180910390fd5b60008973ffffffffffffffffffffffffffffffffffffffff168989604051610212929190610981565b6000604051808303816000865af19150503d806000811461024f576040519150601f19603f3d011682016040523d82523d6000602084013e610254565b606091505b5050905080610298576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028f906109e6565b60405180910390fd5b5050505050505050505050565b60006020528060005260406000206000915090505481565b60007f19457468657265756d205369676e6564204d6573736167653a0a33320000000060005281601c52603c6000209050919050565b6000806000610302858561031a565b9150915061030f8161036b565b819250505092915050565b600080604183510361035b5760008060006020860151925060408601519150606086015160001a905061034f878285856104d1565b94509450505050610364565b60006002915091505b9250929050565b6000600481111561037f5761037e610a06565b5b81600481111561039257610391610a06565b5b03156104ce57600160048111156103ac576103ab610a06565b5b8160048111156103bf576103be610a06565b5b036103ff576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103f690610a81565b60405180910390fd5b6002600481111561041357610412610a06565b5b81600481111561042657610425610a06565b5b03610466576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161045d90610aed565b60405180910390fd5b6003600481111561047a57610479610a06565b5b81600481111561048d5761048c610a06565b5b036104cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104c490610b7f565b60405180910390fd5b5b50565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08360001c111561050c5760006003915091506105aa565b6000600187878787604051600081526020016040526040516105319493929190610bd4565b6020604051602081039080840390855afa158015610553573d6000803e3d6000fd5b505050602060405103519050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036105a1576000600192509250506105aa565b80600092509250505b94509492505050565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006105e8826105bd565b9050919050565b6105f8816105dd565b811461060357600080fd5b50565b600081359050610615816105ef565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126106405761063f61061b565b5b8235905067ffffffffffffffff81111561065d5761065c610620565b5b60208301915083600182028301111561067957610678610625565b5b9250929050565b6000806000806000806080878903121561069d5761069c6105b3565b5b60006106ab89828a01610606565b96505060206106bc89828a01610606565b955050604087013567ffffffffffffffff8111156106dd576106dc6105b8565b5b6106e989828a0161062a565b9450945050606087013567ffffffffffffffff81111561070c5761070b6105b8565b5b61071889828a0161062a565b92509250509295509295509295565b60006020828403121561073d5761073c6105b3565b5b600061074b84828501610606565b91505092915050565b6000819050919050565b61076781610754565b82525050565b6000602082019050610782600083018461075e565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006107c282610754565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036107f4576107f3610788565b5b600182019050919050565b60008160601b9050919050565b6000610817826107ff565b9050919050565b60006108298261080c565b9050919050565b61084161083c826105dd565b61081e565b82525050565b600081905092915050565b82818337600083830152505050565b600061086d8385610847565b935061087a838584610852565b82840190509392505050565b6000819050919050565b6108a161089c82610754565b610886565b82525050565b60006108b38289610830565b6014820191506108c38288610830565b6014820191506108d4828688610861565b91506108e08285610890565b6020820191506108f08284610890565b602082019150819050979650505050505050565b600082825260208201905092915050565b7f496e76616c6964207369676e6174757265000000000000000000000000000000600082015250565b600061094b601183610904565b915061095682610915565b602082019050919050565b6000602082019050818103600083015261097a8161093e565b9050919050565b600061098e828486610861565b91508190509392505050565b7f5472616e73616374696f6e206661696c65640000000000000000000000000000600082015250565b60006109d0601283610904565b91506109db8261099a565b602082019050919050565b600060208201905081810360008301526109ff816109c3565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f45434453413a20696e76616c6964207369676e61747572650000000000000000600082015250565b6000610a6b601883610904565b9150610a7682610a35565b602082019050919050565b60006020820190508181036000830152610a9a81610a5e565b9050919050565b7f45434453413a20696e76616c6964207369676e6174757265206c656e67746800600082015250565b6000610ad7601f83610904565b9150610ae282610aa1565b602082019050919050565b60006020820190508181036000830152610b0681610aca565b9050919050565b7f45434453413a20696e76616c6964207369676e6174757265202773272076616c60008201527f7565000000000000000000000000000000000000000000000000000000000000602082015250565b6000610b69602283610904565b9150610b7482610b0d565b604082019050919050565b60006020820190508181036000830152610b9881610b5c565b9050919050565b6000819050919050565b610bb281610b9f565b82525050565b600060ff82169050919050565b610bce81610bb8565b82525050565b6000608082019050610be96000830187610ba9565b610bf66020830186610bc5565b610c036040830185610ba9565b610c106060830184610ba9565b9594505050505056fea2646970667358221220d3b32db3f827190ab0a25ae1beef06aa8e3054ece104a1d27030c2107d61be4164736f6c634300081c0033";
const isSuperArgs = (xs) => xs.length > 1;
class GaslessForwarder__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    connect(runner) {
        return super.connect(runner);
    }
    static createInterface() {
        return new ethers_1.Interface(_abi);
    }
    static connect(address, runner) {
        return new ethers_1.Contract(address, _abi, runner);
    }
}
exports.GaslessForwarder__factory = GaslessForwarder__factory;
GaslessForwarder__factory.bytecode = _bytecode;
GaslessForwarder__factory.abi = _abi;
