import React from 'react';

const TeamPageLayout = ({
  children,
  simulationStats,
  schedule
}: Readonly<{
  children: React.ReactNode;
  simulationStats: React.ReactNode;
  schedule: React.ReactNode;
}>) => {
  return (
    <>
      {children}
      <div className='flex gap-8 '>
        <div className='w-1/2'>

          {schedule}
        </div>
        <div className='w-1/2'>

          {simulationStats}
        </div>
      </div>
    </>
  )
}

export default TeamPageLayout