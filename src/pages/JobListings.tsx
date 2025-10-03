import React from 'react';
import { JobListing } from '../components/JobListings'; // Fixed import path

const JobListings: React.FC = () => {
    return (
        <div className="w-full overflow-x-hidden">
            <JobListing />
        </div>
    );
};

export default JobListings;