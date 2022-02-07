import {
  Text,
  Box,
  Grid,
  Flex,
  Image,
  Heading,
  GridItem,
  Divider,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import ape from "../assets/Bored-Ape-Yacht-Club-Adidas.jpg";
import crown from "../assets/il_fullxfull.2369143838_c055.jpg";
import { useMoralis } from "react-moralis";

export default function LandingPage() {
  const [voted, setVoted] = useState(false);
  const [nfts, setNfts] = useState([
    {
      name: "ape",
      image: ape,
      votos: "38",
    },
    {
      name: "ape",
      image: ape,
      votos: "17",
    },
    {
      name: "ape",
      image: ape,
      votos: "15",
    },
    {
      name: "ape",
      image: ape,
      votos: "10",
    },
    {
      name: "ape",
      image: ape,
      votos: "6",
    },
    {
      name: "ape",
      image: ape,
      votos: "1",
    },
  ]);

  function manageVote(i) {
    // 1. Make a shallow copy of the items
    let nfts2 = [...nfts];
    // 2. Make a shallow copy of the item you want to mutate
    let nft = { ...nfts2[i] };
    // 3. Replace the property you're intested in
    nft.votos = parseInt(nft.votos) + 1;
    // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
    nfts2[0] = nft;
    // 5. Set the state to our new copy
    setNfts(nfts2);
    setVoted(true);
  }

  return (
    <Flex h="94vh" justify="center">
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={10}
        w="70%"
        h="70%"
        mt="5%"
        align="center"
        justify="center"
      >
        {nfts.map((nft, index) => (
          <GridItem key={index}>
            <Flex
              borderRadius="5px"
              p="10"
              border="1px"
              borderStyle="dashed"
              align="center"
              justify="center"
            >
              <Flex
                flexDirection="column"
                w="80%"
                align="center"
                justify="center"
                h="100%"
              >
                <Flex w="70%" justify="space-around" flexDirection="row">
                  <Heading>{nft.name}</Heading>
                  <Heading>{nft.votos}</Heading>
                </Flex>
                <Image src={nft.image} />
                {!voted && (
                  <Button
                    mt="3%"
                    bg="#3D76E0"
                    _hover={{ bg: "#28ACEA" }}
                    onClick={() => {
                      manageVote(index);
                    }}
                  >
                    Vote
                  </Button>
                )}
              </Flex>
            </Flex>
          </GridItem>
        ))}
      </Grid>
    </Flex>
  );
}
