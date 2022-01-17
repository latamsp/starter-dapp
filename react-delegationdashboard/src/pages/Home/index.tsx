import React from 'react';
import { Redirect } from 'react-router-dom';
import { faBan, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import mainLogo from 'assets/images/logo.svg';
import State from 'components/State';
import { useContext } from 'context';
import WalletLogin from './Login/Wallet';
import WalletConnectLogin from './Login/WalletConnect';
  import { decimals, denomination } from 'config';
import denominate from 'components/Denominate/formatters';
import StatCard from 'components/StatCard';
import { Address, NetworkStake } from '@elrondnetwork/erdjs/out';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Home = () => {
  const {
    dapp,
    egldLabel,
    totalActiveStake,
    numberOfActiveNodes,
    address,
    contractOverview,
    aprPercentage,
    numUsers,
  } = useContext();
  const [networkStake, setNetworkStake] = useState(new NetworkStake());
  const getPercentage = (amountOutOfTotal: string, total: string) => {
    let percentage =
        (parseInt(amountOutOfTotal.replace(/,/g, '')) / parseInt(total.replace(/,/g, ''))) * 100;
    if (percentage < 1) {
      return '<1';
    }
    return percentage ? percentage.toFixed(2) : '...';
  };
  const isAdmin = () => {
    let loginAddress = new Address(address).hex();
    return loginAddress.localeCompare(contractOverview.ownerAddress) === 0;
  };
  const getNetworkStake = () => {
    dapp.apiProvider
        .getNetworkStake()
        .then(value => {
          setNetworkStake(value);
        })
        .catch(e => {
          console.error('getTotalStake error ', e);
        });
  };
  React.useEffect(() => {
    getNetworkStake();
  }, []);
  const { loading, error, loggedIn } = useContext();
  const ref = React.useRef(null);
  const { pathname } = useLocation();
  const { delegationContract } = useContext();
  let expl = 'https://explorer.elrond.com/providers/';
  return (
      <div ref={ref} className="home d-flex flex-fill align-items-center">
        {error ? (
            <State
                icon={faBan}
                iconClass="text-primary"
                title="Something went wrong"
                description="If the problem persists please contact support."
            />
        ) : loggedIn ? (
            <Redirect to="/dashboard" />
        ) : loading ? (
            <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
        ) : (
            <div className="dashboard w-100">
              <div className="card my-spacer text-center d-flex just">
                <div className="card-body p-spacer">
                  <a href="https://latamsp.com/"><img className="logo" src={mainLogo} height="40"/></a>
                  <h4 className="p-spacer">Elrond Delegation Manager</h4>
                  <p className="p-spacer"></p>

                  <div className="cards d-flex flex-wrap mr-spacer">
                    <StatCard
                        title="Contract Stake"
                        value={denominate({
                          input: totalActiveStake,
                          denomination,
                          decimals,
                          showLastNonZeroDecimal: false,
                        })}
                        valueUnit={egldLabel}
                        color="orange"
                        svg="contract.svg"
                        percentage={`${getPercentage(
                            denominate({
                              input: totalActiveStake,
                              denomination,
                              decimals,
                              showLastNonZeroDecimal: false,
                            }),
                            denominate({
                              input: networkStake.TotalStaked.toFixed(),
                              denomination,
                              decimals,
                              showLastNonZeroDecimal: false,
                            })
                        )}% of total stake`}
                    />
                    <StatCard title="Number of Users" value={numUsers.toString()} color="orange" svg="user.svg" />
                    <StatCard
                        title="Number of Nodes"
                        value={numberOfActiveNodes}
                        valueUnit=""
                        color="orange"
                        svg="nodes.svg"
                        percentage={`${getPercentage(
                            numberOfActiveNodes,
                            networkStake.TotalValidators.toString()
                        )}% of total nodes`}
                    />
                    <StatCard
                        title="Computed APR"
                        value={aprPercentage}
                        valueUnit=""
                        color="orange"
                        svg="leaf-solid.svg"
                        tooltipText="This is an approximate APR calculation for this year based on the current epoch incl. service fee"
                    />
                    <StatCard
                        title="Service Fee"
                        value={contractOverview.serviceFee || ''}
                        valueUnit="%"
                        color="orange"
                        svg="service.svg"
                    />
                    <StatCard
                        title="Delegation Cap"
                        value={
                          denominate({
                            decimals,
                            denomination,
                            input: contractOverview.maxDelegationCap,
                            showLastNonZeroDecimal: false,
                          }) || ''
                        }
                        valueUnit={egldLabel}
                        color="orange"
                        svg="delegation.svg"
                        percentage={`${getPercentage(
                            denominate({
                              input: totalActiveStake,
                              denomination,
                              decimals,
                              showLastNonZeroDecimal: false,
                            }),
                            denominate({
                              decimals,
                              denomination,
                              input: contractOverview.maxDelegationCap,
                              showLastNonZeroDecimal: false,
                            })
                        )}% filled`}
                    ></StatCard>
                  </div>
                  <p className="mb-spacer"></p>
                  <div className="py-spacertext-truncate">
                    <a href={expl+delegationContract} target="_blank">
                      <p className="mb-0"><u>Delegation Contract Address</u></p>
                    </a>
                  </div>
                  <p className="lead mb-spacer">
                  </p>
                  <p className="mb-spacer"></p>
              <div>
                <a
                  href={process.env.PUBLIC_URL + '/ledger'}
                  className="btn btn-primary px-sm-spacer mx-1 mx-sm-3"
                >
                  Ledger
                </a>
                <WalletLogin />
                <WalletConnectLogin />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
