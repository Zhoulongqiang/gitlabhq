require 'spec_helper'

describe Gitlab::Verify::JobArtifacts do
  before do
    stub_artifacts_object_storage
  end

  it 'includes CI job artifacts in object storage' do
    local_failure = create(:ci_job_artifact)
    remote_failure = create(:ci_job_artifact, :remote_store)

    failures = {}
    described_class.new(batch_size: 10).run_batches { |_, failed| failures.merge!(failed) }

    expect(failures.keys).to contain_exactly(local_failure, remote_failure)
  end
end
