// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;
import "truffle/console.sol";

contract EgMarket {
    struct Request {
        address owner;
        uint qty;
    }

    struct Offer {
        address owner;
        uint qty;
        uint price;
    }

    address public mainProvider;
    Request[] public requests;
    Offer[] public offers;

    function getMainProvider() public view returns (address) {
        return mainProvider;
    }

    function getRequests() public view returns (Request[] memory) {
        return requests;
    }

    function getOffers() public view returns (Offer[] memory) {
        return offers;
    }

    function placeOffer(uint _qty, uint _price) public {
        console.log("In placeOffer");
        Offer memory o;
        o.owner = msg.sender;
        o.qty = _qty;
        o.price = _price;
        offers.push(o);
        console.log("Out placeOffer");
    }

    function placeRequest(uint _qty) public {
        console.log("In placeRequest");
        require(msg.sender != mainProvider, "Main Provider Can't Ask");
        Request memory r;
        r.owner = msg.sender;
        r.qty = _qty;
        requests.push(r);
        console.log("Out placeRequest");
    }

    // remove offer, request

    function removeRequest(uint index) public {
        console.log("In removeRequest");
        require(index < requests.length, "'Request' index out of range");
        
        for (uint i = index; i<requests.length-1; i++){
            requests[i] = requests[i+1];
        }
        // delete requests[requests.length - 1];
        requests.pop();
        console.log("Out removeRequest");
    }

    function removeOffer(uint index) public {
        console.log("In removeOffer");
        require(index < offers.length, "'Offer' index out of range");
        
        for (uint i = index; i<offers.length-1; i++){
            offers[i] = offers[i+1];
        }
        // delete offers[offers.length - 1];
        offers.pop();
        console.log("Out removeOffer");
    }
}
