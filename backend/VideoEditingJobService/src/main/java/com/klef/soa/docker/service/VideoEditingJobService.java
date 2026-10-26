package com.klef.soa.docker.service;

import java.util.List;

import com.klef.soa.docker.dto.VideoEditingJobRequest;
import com.klef.soa.docker.dto.VideoEditingJobResponse;

public interface VideoEditingJobService
{
    VideoEditingJobResponse saveVideoEditingJob(VideoEditingJobRequest request);
    VideoEditingJobResponse updateVideoEditingJob(Long id, VideoEditingJobRequest request);
    List<VideoEditingJobResponse> getAllVideoEditingJobs();
    VideoEditingJobResponse getVideoEditingJobById(Long id);
    String deleteVideoEditingJob(Long id);
}