import { Link } from "react-router-dom";
import {
  Heading,
  Button,
  HStack,
  Flex,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Divider,
  Text,
  Icon,
  IconButton,
  Avatar,
  Box,
  AvatarBadge,
  AvatarGroup,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { useMoralis } from "react-moralis";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import axios from "axios";

export default function Header() {
  const { authenticate, isAuthenticated, user, logout, Moralis } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState(null);

  async function initProvider() {
    const initMoralis = Moralis.Web3API.account;
    if (user) {
      const options = {
        chain: "mumbai",
        address: user.get("ethAddress"),
      };

      const currentBalance = await initMoralis.getNativeBalance(options);
      setBalance(currentBalance.balance);
    }
  }

  useEffect(() => {
    initProvider();
  }, []);

  const btnRef = useRef();
  console.log("header");

  async function getUserAddress() {
    await axios.get(
      `https://api.moralis.com/v2/user/${user.get("ethAddress")}`
    );
  }

  return (
    <Flex>
      {isAuthenticated ? (
        <HStack mt="1%" w="100%" justify="space-between">
          <Flex align="center" justify="center" w="15%">
            <Link to="/">
              <Heading color="#3D76E0">DAOVinci</Heading>
            </Link>
          </Flex>

          <Link to="/governance">
            <Text
              fontWeight="bold"
              color="#3D76E0"
              _hover={{ color: "#28ACEA" }}
            >
              Vote
            </Text>
          </Link>

          <Link color="#28ACEA" to="/mint">
            <Text
              fontWeight="bold"
              color="#3D76E0"
              _hover={{ color: "#28ACEA" }}
            >
              Mint
            </Text>
          </Link>
          <Flex>
            <Button
              ref={btnRef}
              onClick={onOpen}
              bg="none"
              _hover={{ bg: "none" }}
              _focus={{ border: "1px" }}
              _active={{ bg: "none", border: "none" }}
            >
              <Icon
                color="#3D76E0"
                _hover={{ color: "#28ACEA" }}
                boxSize={10}
                as={MdOutlineAccountBalanceWallet}
              />
            </Button>
          </Flex>

          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerBody p="4">
                <Flex mt="3%" align="center" justify="space-between">
                  <Avatar size="md" name="John Doe" />
                  <Box w="30%">
                    {" "}
                    <Text isTruncated>{user.get("ethAddress")}</Text>
                  </Box>
                </Flex>
                <Box mt="7%" bg="grey" w="100%" h="1px" />
                <Flex h="30%" mt="3%">
                  <Box
                    border="1px"
                    borderRadius="10px"
                    boderColor="#28ACEA"
                    borderStyle="dashed"
                    textAlign="center"
                    justify="center"
                    h="70%"
                    w="100%"
                  >
                    <Heading color="#3D76E0">Current Balance</Heading>
                    <Flex
                      textAlign="center"
                      justify="center"
                      fontSize="3xl"
                      fontWeight="bold"
                      flexDirection="row"
                    >
                      <Text fontSize="3xl" fontWeight="bold">
                        {balance}
                      </Text>
                      <Text ml="5px">MATIC</Text>
                    </Flex>
                  </Box>
                </Flex>
              </DrawerBody>

              <DrawerFooter pr="0">
                <Button
                  color="white"
                  bg="#3D76E0"
                  border="none"
                  _hover={{ bg: "#28ACEA", color: "black" }}
                  _focus={{ border: "none" }}
                  mr={3}
                  onClick={logout}
                >
                  Logout
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </HStack>
      ) : (
        <HStack mt="1%" w="100%" justify="space-around">
          <Link to="/governance">Vote</Link>
          <Link to="/">
            <Heading>DAOVinci</Heading>
          </Link>

          <Link to="/mint">Mint</Link>
          <Button onClick={authenticate}> Connect Wallet</Button>
        </HStack>
      )}
    </Flex>
  );
}
