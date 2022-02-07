import {
  Box,
  Flex,
  Image,
  Heading,
  Input,
  VStack,
  AspectRatio,
  Button,
  FormLabel,
  Text,
  Textarea,
  Radio,
  Stack,
  RadioGroup,
  Tooltip,
  Icon,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import ape from "../assets/Bored-Ape-Yacht-Club-Adidas.jpg";
import { BsFillImageFill } from "react-icons/bs";
import { useDisclosure } from "@chakra-ui/react";
import { useMoralis } from "react-moralis";
import abi from "../contracts/art-collection.json";
import { ethers } from "ethers";

export default function MintingPage() {
  const { authenticate, authErros, isAuthenticated, user, Moralis } =
    useMoralis();
  const [provider, setProvider] = useState(null);
  const [image, setImage] = useState("");
  const { handleSubmit, register, control, reset, getValues } = useForm({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("1");

  const getProvider = async () => {
    setProvider(await Moralis.enableWeb3());
  };

  useEffect(() => {
    getProvider();
  }, []);

  console.log("isto é provider" + provider);

  const [nft, setNFT] = useState({
    title: "",
    collection: "",
    image: "",
    description: "",
    artist: "",
  });

  const contractAddress = "0x2055cD49058c9c6B3007788C9B1A99527252c6A2";
  const contractABI = abi;

  function setTempImage(e) {
    setImage(e.target.files[0]);
  }

  function mintNFT(data) {
    const artist = user.get("ethAddress");
    nft.artist = artist;
    setNFT({
      ...user,
      title: data.title,

      collection: data.collection,
      description: data.description,
    });
  }

  function mintNFTGovernance(uri) {
    console.log("isto é o uri " + uri);
    const sendOptions = {
      contractAddress: contractAddress,
      functionName: "propose",
      abi: contractABI,
      params: {
        _uri: uri,
      },
    };
    const transaction = Moralis.executeFunction(sendOptions);
    console.log(transaction.hash);
  }

  async function uploadMetaDataGovernance(url) {
    var uri = "";
    const options = {
      method: "POST",
      body: JSON.stringify({
        name: nft.title,
        description: nft.description,
        file_url: url,
      }),
      headers: {
        Authorization: "cd3eb097-b356-463d-8a17-94c60df69b76",
      },
    };
    await fetch("https://api.nftport.xyz/v0/metadata", options)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        uri = responseJson.metadata_uri;
        mintNFTGovernance(uri);
      });
  }

  async function deployIPFSGovernance() {
    const form = new FormData();
    let ipfs_url = "";
    form.append("file", image);

    const options = {
      method: "POST",
      body: form,
      headers: {
        Authorization: "cd3eb097-b356-463d-8a17-94c60df69b76",
      },
    };
    //1step upload image to ipfs
    await fetch("https://api.nftport.xyz/v0/files", options)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        // Handle the response
        console.log(responseJson);
        ipfs_url = responseJson.ipfs_url;
      });
    const uri = await uploadMetaDataGovernance(ipfs_url);
  }

  function mintForMyself(metadata_uri) {
    console.log(metadata_uri);
    const options = {
      method: "POST",
      body: JSON.stringify({
        chain: "polygon",
        contract_address: "0x66816952113000FC307E8dc2587b3E736574ae1f",
        metadata_uri:
          "ipfs://bafkreic7moadscwfbldhscto757pylwqjedgyktrjleuh4icdgnbjxap4u",
        mint_to_address: user.get("accounts")[0],
      }),
      headers: {
        Authorization: "9c3875bf-59a5-47ec-b086-cbd3a9032cc5",
      },
    };
    fetch("https://api.nftport.xyz/v0/mints/customizable", options).then(
      (res) => {
        return res.metadata_uri;
      }
    );
  }

  function uploadMetaData(url) {
    var metadata_uri = "";
    const options = {
      method: "POST",
      body: JSON.stringify({
        name: nft.title,
        description: nft.description,
        file_url: url,
      }),
      headers: {
        Authorization: "cd3eb097-b356-463d-8a17-94c60df69b76",
      },
    };
    fetch("https://api.nftport.xyz/v0/metadata", options).then((res) => {
      return res.metadata_uri;
    });
  }

  function deployIPFS() {
    const form = new FormData();
    let ipfs_url = "";
    form.append("file", image);

    const options = {
      method: "POST",
      body: form,
      headers: {
        Authorization: "cd3eb097-b356-463d-8a17-94c60df69b76",
      },
    };
    //1step upload image to ipfs
    fetch("https://api.nftport.xyz/v0/files", options)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        // Handle the response
        ipfs_url = responseJson.ipfs_url;
      });
    //2step mint nft
    if (ipfs_url) {
      try {
        const metadata_uri = uploadMetaData(ipfs_url);
        //3rd step, finally mint it!
        mintForMyself(metadata_uri);
      } catch (e) {
        console.log(e);
      }
    }
  }

  return (
    <Flex h="94vh" justify="center">
      <Flex w="70%" h="50%">
        <Box w="100%" h="100%">
          {" "}
          <Heading color="#3D76E0" mt="5%">
            Let's create your own artwork!
          </Heading>
          <Flex w="100%">
            <form onSubmit={handleSubmit(mintNFT)} style={{ width: "100%" }}>
              <Modal isCentered isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Mint NFT </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    You are about to send your artwork for{" "}
                    {value == 1 ? "governance" : "your own collection"}, make
                    sure that's what you want to do. Good luck!
                  </ModalBody>

                  <ModalFooter>
                    {value == 1 ? (
                      <Button
                        color="white"
                        _hover={{ bg: "#3D76E0" }}
                        bg="#28ACEA"
                        mr={3}
                        onClick={deployIPFSGovernance}
                      >
                        Mint!
                      </Button>
                    ) : (
                      <Button
                        color="white"
                        _hover={{ bg: "#3D76E0" }}
                        bg="#28ACEA"
                        mr={3}
                        onClick={deployIPFS}
                      >
                        Mint!
                      </Button>
                    )}
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Flex
                justify="flex-start"
                align="flex-start"
                textAlign="flex-start"
                w="100%"
                flexDirection="column"
                mt="5%"
              >
                <Text color="#28ACEA">Choose your NFT's image</Text>
                <Flex w="100%" justify="space-between" flexDirection="row">
                  {image ? (
                    //mostrar aqui a imagem do user
                    <VStack>
                      {" "}
                      <AspectRatio
                        minW="560px"
                        ratio={6 / 3}
                        borderRadius="10"
                        mt="10px"
                      >
                        <Image
                          borderRadius="10"
                          fallbackSrc="https://via.placeholder.com/150"
                          src={URL.createObjectURL(image)}
                        />
                      </AspectRatio>
                      <Input
                        {...register("image")}
                        display={"none"}
                        accept="image/*"
                        type="file"
                        id="file-upload"
                        onChange={setTempImage}
                      />
                      <FormLabel
                        bg="#28ACEA"
                        p="1"
                        htmlFor="file-upload"
                        borderRadius="5px"
                        mt="2%"
                        justify="center"
                        textAlign="center"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                      >
                        Upload Image
                      </FormLabel>
                    </VStack>
                  ) : (
                    <Center
                      borderRadius="5"
                      borderColor="#28ACEA"
                      borderStyle="dashed"
                      w="20%"
                      mt="10px"
                    >
                      <Input
                        {...register("image")}
                        display={"none"}
                        accept="image/*"
                        type="file"
                        id="file-upload"
                        onChange={setTempImage}
                      />

                      <FormLabel
                        border="1px"
                        borderRadius="5"
                        borderColor="#28ACEA"
                        borderStyle="dashed"
                        h="100%"
                        w="100%"
                        htmlFor="file-upload"
                        borderRadius="5px"
                        color="white"
                        justify="center"
                        align="center"
                        _hover={{
                          opacity: "0.6",
                          cursor: "pointer",
                          color: "#3D76E0",
                        }}
                      >
                        <Center h="100%" w="100%">
                          <Icon
                            boxSize="20"
                            color="#28ACEA"
                            as={BsFillImageFill}
                          />
                        </Center>
                      </FormLabel>
                    </Center>
                  )}
                  <Flex w="40%" flexDirection="column">
                    <Flex justify="space-between" w="100%" flexDirection="row">
                      <Flex flexDirection="column">
                        <FormLabel>
                          <Text color="#28ACEA">Choose your NFT's name</Text>
                        </FormLabel>
                        <Input
                          {...register("title")}
                          placeholder="Artwork title"
                        />
                      </Flex>

                      <Flex flexDirection="column">
                        <FormLabel>
                          <Text color="#28ACEA">
                            Choose your NFT's collection
                          </Text>
                        </FormLabel>
                        <Input
                          {...register("collection")}
                          placeholder="Artwork collection"
                        />
                      </Flex>
                    </Flex>

                    <FormLabel mt="4%">
                      <Text color="#28ACEA">
                        Add some flavour with a description!
                      </Text>
                    </FormLabel>
                    <Textarea
                      {...register("description")}
                      placeholder="Artwork description"
                    />
                    <RadioGroup
                      {...register("typeOfNFT")}
                      mt="2%"
                      onChange={setValue}
                      value={value}
                    >
                      <Stack direction="row">
                        <Tooltip label="Your artwork will be sent to governance">
                          <Radio value="1">Auction</Radio>
                        </Tooltip>
                        <Tooltip label="Create a NFT for your own use">
                          <Radio value="2">Myself</Radio>
                        </Tooltip>
                      </Stack>
                    </RadioGroup>
                  </Flex>
                </Flex>
                <Button
                  _hover={{ bg: "#3D76E0" }}
                  color="white"
                  bg="#28ACEA"
                  mt="5%"
                  onClick={onOpen}
                  type="submit"
                >
                  Send to governance!
                </Button>
              </Flex>
            </form>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
