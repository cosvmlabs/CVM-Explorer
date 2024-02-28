import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  useColorModeValue,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tabs,
  TabPanels,
  TabPanel,
  Tag,
  TagLeftIcon,
  TagLabel,
  useToast,
  SimpleGrid,
  Flex,
  Stat,
  StatNumber,
  Tooltip,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import {
  FiChevronRight,
  FiHome,
  FiCheck,
  FiX,
  FiBox,
  FiCpu,
  FiUsers,
  FiClock,
} from 'react-icons/fi'
import { GrTransaction } from 'react-icons/gr'
import { FaQuestionCircle, FaPiggyBank, FaGasPump } from 'react-icons/fa'
import { MdOutlinePriceChange } from 'react-icons/md'
import { LiaServicestack } from 'react-icons/lia'
import { GiMining } from 'react-icons/gi'
import { selectNewBlock, selectTxEvent } from '@/store/streamSlice'
import { toHex } from '@cosmjs/encoding'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { timeFromNow, trimHash, getTypeMsg } from '@/utils/helper'
import { getValidators } from '@/rpc/query'
import { selectTmClient } from '@/store/connectSlice'
import { StatusResponse } from '@cosmjs/tendermint-rpc'
import { queryActiveValidators } from '@/rpc/abci'
import { convertRateToPercent, convertVotingPower } from '@/utils/helper'
import { SiHiveBlockchain } from 'react-icons/si'

type ValidatorData = {
  validator: string
  status: string
  votingPower: string
  commission: string
}

import Chart from 'chart.js/auto'

const MAX_ROWS = 15

export default function Home() {
  const newBlock = useSelector(selectNewBlock)
  const txEvent = useSelector(selectTxEvent)
  const [data, setData] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const tmClient = useSelector(selectTmClient)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)

  useEffect(() => {
    if (tmClient) {
      setIsLoading(true)
      queryActiveValidators(tmClient, page, perPage)
        .then((response) => {
          const validatorData: ValidatorData[] = response.validators.map(
            (val) => {
              return {
                validator: val.description?.moniker ?? '',
                status: val.status === 3 ? 'Active' : '',
                votingPower: convertVotingPower(val.tokens),
                commission: convertRateToPercent(
                  val.commission?.commissionRates?.rate
                ),
              }
            }
          )
          setData(validatorData)
          setIsLoading(false)
        })
        .catch(() => {
          toast({
            title: 'Failed to fetch datatable',
            description: '',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        })
    }
  }, [tmClient])
  //validator code

  interface Tx {
    TxEvent: TxEvent
    Timestamp: Date
  }

  const [txs, setTxs] = useState<Tx[]>([])
  const [validators, setValidators] = useState<number>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [status, setStatus] = useState<StatusResponse | null>()

  // State variables
  const [blocks, setBlocks] = useState<NewBlockEvent[]>([])

  const [totalTransactions, setTotalTransactions] = useState<number>(0)

  // Other code remains the same...

  useEffect(() => {
    // Function to calculate total transactions
    const calculateTotalTransactions = (txs: Tx[]) => {
      return txs.length
    }

    // Update total transactions when txs array changes
    setTotalTransactions(calculateTotalTransactions(txs))
  }, [txs])

  // Function to update blocks

  useEffect(() => {
    if (tmClient) {
      tmClient.status().then((response) => setStatus(response))
      getValidators(tmClient).then((response) => setValidators(response.total))
    }
  }, [tmClient])

  useEffect(() => {
    if ((!isLoaded && newBlock) || (!isLoaded && status)) {
      setIsLoaded(true)
    }
  }, [isLoaded, newBlock, status])

  useEffect(() => {
    if (newBlock) {
      updateBlocks(newBlock)
    }
  }, [newBlock])

  useEffect(() => {
    if (txEvent) {
      updateTxs(txEvent)
    }
  }, [txEvent])

  const updateBlocks = (block: NewBlockEvent) => {
    if (blocks.length) {
      if (block.header.height > blocks[0].header.height) {
        setBlocks((prevBlocks) => [block, ...prevBlocks.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setBlocks([block])
    }
  }

  const updateTxs = (txEvent: TxEvent) => {
    const tx = {
      TxEvent: txEvent,
      Timestamp: new Date(),
    }
    if (txs.length) {
      if (
        txEvent.height >= txs[0].TxEvent.height &&
        txEvent.hash !== txs[0].TxEvent.hash
      ) {
        setTxs((prevTx) => [tx, ...prevTx.slice(0, MAX_ROWS - 1)])
      }
    } else {
      setTxs([tx])
    }
  }

  const renderMessages = (data: Uint8Array | undefined) => {
    if (data) {
      const txBody = TxBody.decode(data)
      const messages = txBody.messages

      if (messages.length === 1) {
        return (
          <HStack>
            <Tag colorScheme="cyan">{getTypeMsg(messages[0].typeUrl)}</Tag>
          </HStack>
        )
      } else if (messages.length > 1) {
        return (
          <HStack>
            <Tag colorScheme="cyan">{getTypeMsg(messages[0].typeUrl)}</Tag>
            <Text textColor="cyan.800">+{messages.length - 1}</Text>
          </HStack>
        )
      }
    }

    return ''
  }

  function displayDate(dateString: string): string {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
      .getSeconds()
      .toString()
      .padStart(2, '0')}`
  }

  useEffect(() => {
    // Create Block Transaction Chart
    const ctx = document.getElementById(
      'blockTransactionChart'
    ) as HTMLCanvasElement
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: blocks.map((block) => {
            const time = block.header.time
              ? ` (${displayDate(block.header.time.toISOString())})`
              : ''
            return `${time}`
          }),
          datasets: [
            {
              label: 'Blocks Height',
              data: blocks.map((block) => block.header.height), // Use block.header.height for y-axis
              backgroundColor: [
                'yellow',
                'aqua',
                'pink',
                'lightgreen',
                'lightblue',
                'gold',
              ], // Fill color
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 2, // Border width
              pointRadius: 4, // Point radius
              tension: 0.1,
              fill: false, // Do not fill area under the line
            },
            {
              label: 'Block Time',
              data: txs.map((_, index) => index + 1),
              backgroundColor: 'rgba(255, 99, 132, 0.2)', // Fill color
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2, // Border width
              pointRadius: 4, // Point radius
              tension: 0.1,
              fill: false, // Do not fill area under the line
            },
          ],
        },
        options: {
          responsive: true, // Make the chart responsive
          maintainAspectRatio: false, // Disable aspect ratio
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Block Height',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top', // Adjust the legend position
              labels: {
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
            title: {
              display: true,
              text: 'Block Height and Time Chart', // Chart title
              font: {
                size: 16,
                weight: 'bold',
              },

              padding: 20, // Padding around the title
            },
          },
          // Add white background
          backgroundColor: 'white',
          // Add padding
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            },
          },
        },
      })

      return () => {
        chart.destroy()
      }
    }
  }, [blocks, txs])

  interface TransactionChartData {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      fill?: boolean
      borderColor?: string
      tension?: number
    }[]
  }

  // Set initial state with type TransactionChartData
  const [transactionData, setTransactionData] = useState<TransactionChartData>({
    labels: [],
    datasets: [
      {
        label: 'Total Transactions',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  })

  // Then in useEffect, set the data with type TransactionChartData
  useEffect(() => {
    const aggregateTransactionsByDay = (transactions: Tx[]) => {
      const aggregatedData: { [date: string]: number } = {}

      transactions.forEach((tx) => {
        const date = new Date(tx.Timestamp).toISOString().split('T')[0]
        aggregatedData[date] = (aggregatedData[date] || 0) + 1
      })

      return aggregatedData
    }

    const aggregatedData = aggregateTransactionsByDay(txs)
    const dates = Object.keys(aggregatedData)
    const transactionCounts = Object.values(aggregatedData)

    // Update transactionData with the correct type
    setTransactionData({
      labels: dates,
      datasets: [
        {
          label: 'Total Transactions',
          data: transactionCounts,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    })
  }, [txs])

  return (
    <>
      <Head>
        <title>CVM | Explorer</title>
        <meta name="description" content="Home | CVMexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Home</Heading>
          <Divider borderColor={'gray'} size="10px" orientation="vertical" />
          <Link
            as={NextLink}
            href={'/'}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            display="flex"
            justifyContent="center"
          >
            <Icon
              fontSize="15"
              color={useColorModeValue('light-theme', 'dark-theme')}
              as={FiHome}
            />
          </Link>
          <Icon fontSize="15" as={FiChevronRight} />
          <Text>Home</Text>
        </HStack>
        <Box mt={8}>
          <SimpleGrid minChildWidth="245px" spacing="12px">
            <Link
              as={NextLink}
              href="/blocks"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <BoxInfo
                bgColor="cyan.200"
                color="cyan.600"
                icon={FiBox}
                name="Latest Block"
                value={
                  newBlock?.header.height || status?.syncInfo.latestBlockHeight
                }
                tooltext={
                  newBlock?.header.time
                    ? displayDate(newBlock?.header.time.toISOString())
                    : status?.syncInfo.latestBlockTime
                    ? displayDate(
                        status?.syncInfo.latestBlockTime.toISOString()
                      )
                    : ''
                }
              />
            </Link>
            <Link
              as={NextLink}
              href="/blocks"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <BoxInfo
                bgColor="cyan.200"
                color="cyan.600"
                icon={FiClock}
                name="Block Time"
                value={
                  newBlock?.header.time
                    ? displayDate(newBlock?.header.time.toISOString())
                    : status?.syncInfo.latestBlockTime
                    ? displayDate(
                        status?.syncInfo.latestBlockTime.toISOString()
                      )
                    : ''
                }
                tooltext={
                  newBlock?.header.height || status?.syncInfo.latestBlockHeight
                }
              />
            </Link>
            <BoxInfo
              bgColor="orange.200"
              color="orange.600"
              icon={FiCpu}
              name="Network"
              value={newBlock?.header.chainId || status?.nodeInfo.network}
              tooltext="CosVM Network"
            />
            <BoxInfo
              bgColor="purple.200"
              color="purple.600"
              icon={FiUsers}
              name="Validators"
              value={validators}
              tooltext="Count"
            />
          </SimpleGrid>
        </Box>
        <Box
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          mt={8}
        >
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            flex={{ base: '1', md: '3' }}
            mr={{ base: 0, md: 8 }}
            mb={{ base: 8, md: 0 }}
            style={{ width: '100%' }}
          >
            <canvas
              id="blockTransactionChart"
              style={{ width: '100%', height: '400px' }}
            ></canvas>
          </Box>
          <Box flex={{ base: '1', md: '1' }} style={{ width: '100%' }}>
            <SimpleGrid columns={1} minChildWidth="270px" spacing={2}>
              <Link
                as={NextLink}
                href="/blocks"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <BoxInfo
                  bgColor="cyan.200"
                  color="cyan.600"
                  icon={MdOutlinePriceChange}
                  name="CVM PRICE"
                  value={'---------'}
                  tooltext="Coin"
                />
              </Link>

              <Link
                as={NextLink}
                href="/"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <BoxInfo
                  bgColor="cyan.200"
                  color="cyan.600"
                  icon={LiaServicestack}
                  name="Stack Value"
                  value={'---------'}
                  tooltext="20% CVM Stacked "
                />
              </Link>

              <BoxInfo
                bgColor="orange.200"
                color="orange.600"
                icon={FaGasPump}
                name="GAS Track"
                value={'500 Gwei'}
                tooltext="Minimium Price"
              />

              <BoxInfo
                bgColor="cyan.200"
                color="cyan.600"
                icon={GrTransaction}
                name="Transactions"
                value={totalTransactions}
                tooltext="Per BLock"
              />
            </SimpleGrid>
          </Box>
        </Box>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Tabs variant="unstyled">
            <Box display="flex" alignItems="center">
              <Icon as={SiHiveBlockchain} color="gray.500" />
              <>
                {' '}
                {/* React Fragment for spacing */}
                &nbsp;&nbsp;&nbsp; {/* Non-breaking spaces for spacing */}
              </>
              <Heading size="md"> Latest Block</Heading>
            </Box>

            <TabPanels>
              <TabPanel>
                <TableContainer>
                  <Table variant="striped" colorScheme="teal">
                    <Thead>
                      <Tr>
                        <th>
                          {' '}
                          <CheckIcon color="green.500" />
                        </th>
                        <Th>Height</Th>
                        <Th>App Hash</Th>
                        <Th>Txs</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {blocks.map((block) => (
                        <Tr key={block.header.height}>
                          <Td>
                            <Tooltip label="Success" aria-label="A tooltip">
                              <CheckIcon color="green.500" />
                            </Tooltip>
                          </Td>
                          <Td>
                            <Link
                              as={NextLink}
                              href={'/blocks/' + block.header.height}
                              style={{ textDecoration: 'none' }}
                              _focus={{ boxShadow: 'none' }}
                            >
                              <Text color={'cyan.400'}>
                                {block.header.height}
                              </Text>
                            </Link>
                          </Td>
                          <Td noOfLines={1}>{toHex(block.header.appHash)}</Td>
                          <Td>{block.txs.length}</Td>
                          <Td>
                            {timeFromNow(block.header.time.toISOString())}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Box
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          mt={8}
        >
          <Box
            flex={{ base: '1', md: '1' }}
            mr={{ base: 0, md: 8 }}
            mb={{ base: 8, md: 0 }}
          >
            <Box
              bg={useColorModeValue('light-container', 'dark-container')}
              shadow={'base'}
              borderRadius={4}
            >
              <Tabs variant="unstyled">
                <Box display="flex" alignItems="center">
                  <Icon as={FaPiggyBank} color="gray.500" />
                  <>
                    {' '}
                    {/* React Fragment for spacing */}
                    &nbsp;&nbsp;&nbsp; {/* Non-breaking spaces for spacing */}
                  </>
                  <Heading size="md">Latest Transactions</Heading>
                </Box>
                <TabPanels>
                  <TabPanel>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr my=".12rem" pl="0px" color="gray.400">
                            <Th>Tx Hash</Th>
                            <Th>Result</Th>
                            <Th>Messages</Th>
                            <Th>Height</Th>
                            <Th>Time</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {txs.map((tx) => (
                            <Tr key={toHex(tx.TxEvent.hash)}>
                              <Td>
                                <Link
                                  as={NextLink}
                                  href={
                                    '/txs/' +
                                    toHex(tx.TxEvent.hash).toUpperCase()
                                  }
                                  style={{ textDecoration: 'none' }}
                                  _focus={{ boxShadow: 'none' }}
                                >
                                  <Text color={'cyan.400'}>
                                    {trimHash(tx.TxEvent.hash)}
                                  </Text>
                                </Link>
                              </Td>
                              <Td>
                                {tx.TxEvent.result.code == 0 ? (
                                  <Tag variant="subtle" colorScheme="green">
                                    <TagLeftIcon as={FiCheck} />
                                    <TagLabel>Success</TagLabel>
                                  </Tag>
                                ) : (
                                  <Tag variant="subtle" colorScheme="red">
                                    <TagLeftIcon as={FiX} />
                                    <TagLabel>Error</TagLabel>
                                  </Tag>
                                )}
                              </Td>
                              <Td>{renderMessages(tx.TxEvent.result.data)}</Td>
                              <Td>{tx.TxEvent.height}</Td>
                              <Td>{timeFromNow(tx.Timestamp.toISOString())}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Box>
          <Box
            flex={{ base: '1', md: '1' }}
            mr={{ base: 0, md: 8 }}
            mb={{ base: 8, md: 0 }}
          >
            <Box
              bg={useColorModeValue('light-container', 'dark-container')}
              shadow={'base'}
              borderRadius={4}
              p={4}
            >
              <Tabs variant="unstyled">
                <Box display="flex" alignItems="center">
                  <Icon as={GiMining} color="gray.500" />
                  <>
                    {' '}
                    {/* React Fragment for spacing */}
                    &nbsp;&nbsp;&nbsp; {/* Non-breaking spaces for spacing */}
                  </>
                  <Heading size="md">Validators</Heading>
                </Box>
                <TabPanels>
                  <TabPanel>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Validator</Th>
                            <Th>Status</Th>
                            <Th>Voting Power</Th>
                            <Th>Commission</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {data.map((row, index) => (
                            <Tr key={index}>
                              <Td>{row.validator}</Td>
                              <Td>{row.status}</Td>
                              <Td>{row.votingPower}</Td>
                              <Td>{row.commission}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Box>
        </Box>
      </main>
    </>
  )
}

interface BoxInfoProps {
  bgColor: string
  color: string
  icon: React.ElementType
  name: string
  value: string | number | undefined
  tooltext: string | number | undefined
}
const BoxInfo = ({
  bgColor,
  color,
  icon,
  name,
  value,
  tooltext,
}: BoxInfoProps) => {
  const [showTooltipText, setShowTooltipText] = useState(false)

  return (
    <Box
      bg={useColorModeValue('light-container', 'dark-container')}
      shadow="xl"
      borderRadius={4}
      p={4}
      height="150px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Icon fontSize="60" color={color} as={icon} />
          <Heading size="md" ml={2}>
            {name}
          </Heading>
        </Box>

        <Box display="flex" alignItems="center">
          <Tooltip
            label={tooltext}
            placement="left"
            bg="gray.300"
            color="black"
            shouldWrapChildren
          >
            <Box position="relative">
              <Icon as={FaQuestionCircle} boxSize={5} />
            </Box>
          </Tooltip>
        </Box>
      </Flex>

      <Flex justifyContent="center" alignItems="center">
        {' '}
        {/* Centering horizontally */}
        <Stat>
          <StatNumber>{value}</StatNumber>
        </Stat>
      </Flex>
    </Box>
  )
}
