// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "./helpers/ContextMixin.sol";
import "./helpers/NativeMetaTransaction.sol";

contract ArtCollection is
    ERC1155Burnable,
    ERC1155Supply,
    ERC1155Holder,
    ContextMixin,
    NativeMetaTransaction,
    ReentrancyGuard
{
    using SafeERC20 for IERC20;
    using CFAv1Library for CFAv1Library.InitData;

    uint256 public constant MINIMUM_BID_INCREMENT = 0.01 ether;

    ISuperToken public immutable currencyContract; // 0x27e1e4E6BC79D93032abef01025811B7E4727e85 - ?

    uint256 public constant GOVERNANCE_ROUNDS = 10;
    uint256 public constant ROUNDS_DURATION = 7 days;
    uint256 public constant ROUNDS_TOLERANCE = 5 minutes;

    uint256 public tokensLength;
    mapping(uint256 => string) private tokenURIs;

    struct Round {
        uint256 endTimestamp;
        // Bids
        address highestBidAddress;
        uint256 highestBidAmount;
        // Proposals
        mapping(address => string) uri;
        // Votes
        mapping(address => uint256) votes;
        address highestVotedAddress;
    }

    mapping(uint256 => Round) public rounds;
    uint256 public currentRound;

    mapping(address => uint256) public lockedVotes;
    mapping(address => uint256) public lockedForRound;

    string public name;
    string public symbol;
    CFAv1Library.InitData public cfaV1; // Superfluid

    constructor(
        string memory _name,
        string memory _symbol,
        address currencyAddress,
        ISuperfluid host // 0x6EeE6060f715257b970700bc2656De21dEdF074C - 0xEB796bdb90fFA0f28255275e16936D25d3418603
    ) ERC1155("") {
        name = _name;
        symbol = _symbol;
        currencyContract = IERC20(currencyAddress);

        _initializeEIP712(_name);

        // Initialize the governance token
        tokenURIs[0] = "ipfs://QmRHrrMrvXsHZuZ2YfY3RoxJFx6jpm52yDoS8u4rtVnRRR";
        tokensLength = 1;

        // Initialize the first round
        currentRound = 0;
        rounds[0].endTimestamp = block.timestamp + ROUNDS_DURATION;

        // Initialize Superfluid
        cfaV1 = CFAv1Library.InitData(
            host,
            IConstantFlowAgreementV1(
                address(
                    host.getAgreementClass(
                        keccak256(
                            "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                        )
                    )
                )
            )
        );
    }

    /**
     ** Users
     */

    event RecoverGovernanceLog(address indexed user, uint256 amount);

    function recoverGovernance(address _account) private returns (uint256) {
        uint256 lockedAmount = lockedVotes[_account];
        if (lockedAmount == 0 || currentRound <= lockedForRound[msg.sender]) {
            return 0;
        }

        lockedVotes[msg.sender] = 0;
        lockedForRound[msg.sender] = 0;

        safeTransferFrom(address(this), msg.sender, 0, lockedAmount, "");

        emit RecoverGovernanceLog(msg.sender, lockedAmount);

        return lockedAmount;
    }

    function recoverGovernance() external nonReentrant {
        recoverGovernance(msg.sender);
    }

    event ProposeLog(uint256 indexed roundId, address indexed user, string uri);

    function propose(string calldata _uri) external nonReentrant {
        require(bytes(_uri).length > 0, "Empty string");

        uint256 nextRound = currentRound + 1;
        if (nextRound < GOVERNANCE_ROUNDS) {
            nextRound = GOVERNANCE_ROUNDS;
        }

        Round storage round = rounds[nextRound];

        require(round.votes[msg.sender] == 0, "Already proposed");

        round.uri[msg.sender] = _uri;
        round.votes[msg.sender] = 1;

        if (round.highestVotedAddress == address(0)) {
            round.highestVotedAddress = msg.sender;
        }

        emit ProposeLog(nextRound, msg.sender, _uri);
    }

    event VoteLog(uint256 indexed roundId, address indexed user, address vote);

    function vote(address _vote, uint256 _amount) external nonReentrant {
        recoverGovernance(msg.sender);

        uint256 nextRound = currentRound + 1;
        if (nextRound < GOVERNANCE_ROUNDS) {
            nextRound = GOVERNANCE_ROUNDS;
        }

        Round storage round = rounds[nextRound];

        uint256 currentVotes = round.votes[_vote];
        require(currentVotes > 0, "Not proposed");

        uint256 newVotes = currentVotes + _amount;
        round.votes[_vote] = newVotes;

        if (newVotes > round.votes[round.highestVotedAddress]) {
            round.highestVotedAddress = _vote;
        }

        lockedVotes[msg.sender] = lockedVotes[msg.sender] + _amount;
        lockedForRound[msg.sender] = nextRound;

        safeTransferFrom(msg.sender, address(this), 0, _amount, "");

        emit VoteLog(nextRound, msg.sender, _vote);
    }

    event BidLog(uint256 indexed roundId, address indexed user, uint256 amount);

    function bid(uint256 _amount) external nonReentrant {
        uint256 roundId = currentRound;
        Round storage round = rounds[roundId];

        uint256 previousAmount = round.highestBidAmount;
        require(
            _amount >= previousAmount + MINIMUM_BID_INCREMENT,
            "Bid too low"
        );

        uint256 roundEnd = round.endTimestamp;
        require(block.timestamp < round.endTimestamp, "Bid too late");

        uint256 timestampWithTolerance = block.timestamp + ROUNDS_TOLERANCE;
        if (timestampWithTolerance > roundEnd) {
            round.endTimestamp = timestampWithTolerance;
        }

        address previousBidder = round.highestBidAddress;

        round.highestBidAddress = msg.sender;
        round.highestBidAmount = _amount;

        if (previousBidder != address(0)) {
            currencyContract.safeTransfer(previousBidder, previousAmount);
        }

        currencyContract.safeTransferFrom(msg.sender, address(this), _amount);

        emit BidLog(roundId, msg.sender, _amount);
    }

    event SettleLog(
        uint256 indexed roundId,
        address indexed bidder,
        address indexed voted
    );

    function settle() external nonReentrant {
        uint256 roundId = currentRound;
        Round storage round = rounds[roundId];

        require(block.timestamp >= round.endTimestamp, "Not finished");

        uint256 nextRoundId = roundId + 1;
        Round storage nextRound = rounds[nextRoundId];

        currentRound = nextRoundId;
        nextRound.endTimestamp = block.timestamp + ROUNDS_DURATION;

        address highestVoted = round.highestVotedAddress;
        if (highestVoted != address(0)) {
            currencyContract.safeTransfer(
                highestVoted,
                (round.highestBidAmount * 95) / 100
            );

            _mint(highestVoted, 0, 1, ""); // Governance token
        }

        address highestBidder = round.highestBidAddress;
        if (highestBidder != address(0)) {
            if (highestVoted != address(0)) {
                uint256 nextId = tokensLength;
                tokensLength = tokensLength + 1;

                tokenURIs[nextId] = round.uri[highestVoted];
                _mint(highestBidder, nextId, 1, "");
            }

            _mint(highestBidder, 0, 1, ""); // Governance token
        }

        emit SettleLog(roundId, highestBidder, highestVoted);
    }

    /**
     ** Standards
     */

    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return tokenURIs[_tokenId];
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        uint256 delta = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == 0) {
                delta = delta + amounts[i];
            }
        }

        uint256 fromBalance = balanceOf(from, id);
        if (fromBalance == 0) {
            cfaV1.deleteFlow(address(this), from, currencyContract);
        } else {
            cfaV1.updateFlow(from, currencyContract, fromBalance * 0.001 ether);
        }

        uint256 toBalance = balanceOf(to, id);
        if (toBalance == delta) {
            cfaV1.createFlow(to, currencyContract, delta * 0.001 ether);
        } else {
            cfaV1.updateFlow(to, currencyContract, delta * 0.001 ether);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC1155Receiver)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _msgSender() internal view override returns (address sender) {
        return ContextMixin.msgSender();
    }
}
