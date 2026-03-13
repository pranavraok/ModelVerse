"""
Placeholder for legacy StakeRegistry integration.

Node-side staking checks are handled inside JobManager in the current
two-contract architecture (JobManager + ModelRegistry), so no standalone
StakeRegistry calls are required.
"""


class StakeRegistryClient:
	"""No-op placeholder retained for compatibility with older imports."""

	def __init__(self) -> None:
		pass
