// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract EgMarket {
    struct Request {
        address owner;
        uint id;
        uint qty;
    }

    struct Offer {
        address owner;
        uint qty;
        uint price;
        address recipient;
        uint rec_req_id; //recipient request id
        bool isSet; // to find in mapping
    }

    address public mainProvider;
    Request[] public requests;
    Offer[] public offers;
    mapping(uint => Offer) best_offer;

    function setMainProvider(address _mainProvider) public {
        mainProvider = _mainProvider;
    }

    function setBestOffer(uint req_ind, Offer memory o) public returns (bool) { // validate offer then set it as best
        if(!best_offer[req_ind].isSet) {
            best_offer[req_ind] = o;
            best_offer[req_ind].isSet = true;
            return true;
        }
        if((requests[req_ind].owner != o.recipient) || (requests[req_ind].id != o.rec_req_id) || (requests[req_ind].qty != o.qty)) {
            return false;
        }

        if(best_offer[req_ind].price <= o.price) {
            return false;
        }

        best_offer[req_ind].isSet = false; // set old offer to false
        best_offer[req_ind] = o;
        best_offer[req_ind].isSet = true;
        return true;
    }

    function getBestOffer(uint req_ind) public view returns ( Offer memory) {
        return best_offer[req_ind];
    }

    
    function getMainProvider() public view returns (address) {
        return mainProvider;
    }

    function getRequests() public view returns (Request[] memory) {
        return requests;
    }

    function getOffers() public view returns (Offer[] memory) {
        return offers;
    }

    function placeOffer(uint _price, uint req_ind) public returns (bool){
        
        Request memory req = requests[req_ind];
        Offer memory o;
        o.owner = msg.sender;
        o.qty = req.qty; //_qty;
        o.price = _price;
        o.recipient = req.owner; //_recipient;
        o.rec_req_id = req.id;//_rec_req_id;
        offers.push(o);
        return setBestOffer(req_ind, o);         
    }

    function placeRequest(uint _qty, uint _id) public {
        
        require(msg.sender != mainProvider, "Main Provider Can't Ask");
        Request memory r;
        r.owner = msg.sender;
        r.qty = _qty;
        r.id = _id;
        requests.push(r);
        
    }

    // remove offer, request

    function removeRequest(uint index) public {
        
        require(index < requests.length, "'Request' index out of range");
        
        for (uint i = index; i<requests.length-1; i++){
            requests[i] = requests[i+1];
            best_offer[i] = best_offer[i+1];
        }
        // delete requests[requests.length - 1];
        best_offer[requests.length - 1].isSet = false;
        requests.pop();        
    }

    function removeOffer(uint index) public {
        
        require(index < offers.length, "'Offer' index out of range");
        
        for (uint i = index; i<offers.length-1; i++){
            offers[i] = offers[i+1];
        }
        // delete offers[offers.length - 1];
        offers.pop();
        
    }
}
